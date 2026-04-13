import { metadata } from './client';

type FieldNode = { name: string; type: string };
type ObjectNode = {
  nameSingular: string;
  fields: { edges: { node: FieldNode }[] };
};

export async function findObjectByName(
  name: string,
): Promise<ObjectNode | undefined> {
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

  const edges = (result.objects as { edges: { node: ObjectNode }[] }).edges;

  return edges.find((e) => e.node.nameSingular === name)?.node;
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

  return result.findManyApplications.find(
    (app: { universalIdentifier: string }) =>
      app.universalIdentifier === universalIdentifier,
  );
}
