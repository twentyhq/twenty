// Shared helper used by the "+ Sales note" buttons on Person / Company /
// Opportunity record pages. Creates a blank salesNote (status defaults to
// DRAFT in the schema), then attaches the source record via the appropriate
// relation so the new note shows on the parent record's relation panel
// straight away. Returns the new salesNote id so the caller can navigate
// to it.
//
// Why raw fetch + GraphQL strings (not CoreApiClient): the front-component
// sandbox in twenty-sdk@0.8.0 falls over with "TypeError: me is not a function"
// when CoreApiClient is constructed (lesson #2 in the plan file). Logic
// functions run server-side and use CoreApiClient happily — different
// runtime. This helper runs in the front-component sandbox.

const getApiConfig = () => {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY ?? '';
  return { apiUrl, token };
};

const graphqlFetch = async (
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> => {
  const { apiUrl, token } = getApiConfig();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await response.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
};

// Source object the user clicked the button from.
type SourceLink =
  | { kind: 'person'; personId: string }
  | { kind: 'company'; companyId: string }
  | { kind: 'opportunity'; opportunityId: string };

const buildCreateData = (source: SourceLink): Record<string, unknown> => {
  switch (source.kind) {
    case 'company':
      return { companyId: source.companyId };
    case 'opportunity':
      return { opportunityId: source.opportunityId };
    case 'person':
      // Person uses the M2M junction; we link it AFTER the salesNote is
      // created so we can give salesNoteAttendee the new salesNoteId.
      return {};
  }
};

export const createSalesNoteForSource = async (
  source: SourceLink,
): Promise<string> => {
  const createData = buildCreateData(source);

  const createResp = (await graphqlFetch(
    `mutation CreateSalesNoteFromSource($data: SalesNoteCreateInput!) {
       createSalesNote(data: $data) { id }
     }`,
    { data: createData },
  )) as { createSalesNote?: { id?: string } };

  const salesNoteId = createResp.createSalesNote?.id;

  if (typeof salesNoteId !== 'string' || salesNoteId.length === 0) {
    throw new Error('createSalesNote returned no id');
  }

  if (source.kind === 'person') {
    await graphqlFetch(
      `mutation CreateAttendeeFromSource($data: SalesNoteAttendeeCreateInput!) {
         createSalesNoteAttendee(data: $data) { id }
       }`,
      {
        data: {
          salesNoteId,
          personId: source.personId,
        },
      },
    );
  }

  return salesNoteId;
};
