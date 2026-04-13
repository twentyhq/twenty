import { metadata } from './client';

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
