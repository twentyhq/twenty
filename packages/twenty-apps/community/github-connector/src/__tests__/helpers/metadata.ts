import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const metadata = () =>
  new MetadataApiClient({
    headers: {
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
  });

export async function findObjectByName(name: string) {
  const client = metadata();
  const result = await client.query({
    objects: {
      __args: {
        filter: { isCustom: { is: true } },
        paging: { first: 50 },
      },
      edges: {
        node: {
          nameSingular: true,
          fields: {
            __args: { paging: { first: 500 } },
            edges: { node: { name: true, type: true } },
          },
        },
      },
    },
  });

  return result.objects?.edges?.find((e) => e.node.nameSingular === name)?.node;
}

type ExecutionResult = {
  data: unknown;
  status: string;
  duration: number;
  error: unknown;
};

export async function findLogicFunctionId(
  universalIdentifier: string,
): Promise<string> {
  const client = metadata();
  const result = await client.query({
    findManyLogicFunctions: {
      id: true,
      universalIdentifier: true,
    },
  });

  const fn = result.findManyLogicFunctions?.find(
    (f) => f.universalIdentifier === universalIdentifier,
  );

  if (!fn) {
    throw new Error(`Logic function ${universalIdentifier} not found`);
  }

  return fn.id;
}

export async function executeLogicFunction(
  id: string,
  payload: Record<string, unknown>,
): Promise<ExecutionResult> {
  const client = metadata();
  const result = await client.mutation({
    executeOneLogicFunction: {
      __args: { input: { id, payload } },
      data: true,
      status: true,
      duration: true,
      error: true,
    },
  });

  return result.executeOneLogicFunction as ExecutionResult;
}

const BASE_URL = process.env.TWENTY_API_URL ?? 'http://localhost:2021';

export async function callRoute(
  path: string,
  body: Record<string, unknown> | string,
  options: {
    method?: string;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {},
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.auth) {
    headers['Authorization'] = `Bearer ${process.env.TWENTY_API_KEY}`;
  }

  const res = await fetch(`${BASE_URL}/s${path}`, {
    method: options.method ?? 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = await res.text().catch(() => null);
  }
  return { status: res.status, data };
}

export async function findInstalledApp(universalIdentifier: string) {
  const client = metadata();
  const result = await client.query({
    findManyApplications: {
      id: true,
      name: true,
      universalIdentifier: true,
    },
  });

  return result.findManyApplications?.find(
    (app) => app.universalIdentifier === universalIdentifier,
  );
}
