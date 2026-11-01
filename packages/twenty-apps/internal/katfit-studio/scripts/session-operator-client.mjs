export const createSessionOperatorClient = (
  environment = process.env,
  request = fetch,
) => {
  const token = environment.STUDIO_OPERATOR_API_TOKEN;
  const configuredUrl = environment.STUDIO_OPERATOR_CRM_URL;
  if (!token || !configuredUrl || /[\r\n]/.test(token))
    throw Error('Operator credentials missing');
  const origin = new URL(configuredUrl);
  if (
    origin.protocol !== 'https:' ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== '/'
  )
    throw Error('CRM URL must be an HTTPS origin');
  const execute = async (query, variables) => {
    const response = await request(new URL('/graphql', origin), {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok || !response.body) throw Error('Read unavailable');
    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 2 * 1024 * 1024) throw Error('Response too large');
        chunks.push(chunk.value);
      }
    } finally {
      await reader.cancel();
    }
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (result.errors || !result.data) throw Error('Response unconfirmed');
    return result.data;
  };
  return {
    async query(selection) {
      const names = Object.keys(selection);
      if (names.length !== 1) throw Error('Unsupported query');
      const name = names[0];
      if (name === 'studioSessionOperations')
        return execute(
          `query InspectOperation($key: String!) { studioSessionOperations(filter: {operationKey: {eq: $key}}, first: 2) { edges { node { id operationKey classSessionId request ownerToken state result } } pageInfo { hasNextPage } } }`,
          { key: selection[name].__args.filter.operationKey.eq },
        );
      const fields =
        name === 'classSessions'
          ? 'id status mutationLock'
          : name === 'studioMemberships'
            ? 'id mutationLock'
            : null;
      if (!fields) throw Error('Unsupported query');
      return execute(
        `query InspectResource($id: UUID!) { ${name}(filter: {id: {eq: $id}}, first: 2) { edges { node { ${fields} } } pageInfo { hasNextPage } } }`,
        { id: selection[name].__args.filter.id.eq },
      );
    },
    async mutation(selection) {
      const names = Object.keys(selection);
      if (names.length !== 1) throw Error('Unsupported mutation');
      const name = names[0];
      const type =
        name === 'updateClassSessions'
          ? 'ClassSession'
          : name === 'updateStudioMemberships'
            ? 'StudioMembership'
            : null;
      const args = selection[name].__args;
      const conditions = args?.filter?.and;
      if (
        !type ||
        JSON.stringify(args.data) !== '{"mutationLock":null}' ||
        !Array.isArray(conditions) ||
        conditions.length !== 2 ||
        !conditions[0].id?.eq ||
        typeof conditions[1].mutationLock?.eq !== 'string'
      )
        throw Error('Only exact-owner release is allowed');
      return execute(
        `mutation ReleaseTerminalOwner($filter: ${type}FilterInput!, $data: ${type}UpdateInput!) { ${name}(filter: $filter, data: $data) { id mutationLock ${name === 'updateClassSessions' ? 'status' : ''} } }`,
        { filter: args.filter, data: { mutationLock: null } },
      );
    },
  };
};
