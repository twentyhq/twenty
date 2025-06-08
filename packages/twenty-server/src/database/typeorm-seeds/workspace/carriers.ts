import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'carrier';

export const DEV_SEED_CARRIER_IDS = {
  PROGRESSIVE: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
  STATE_FARM: '20202020-ac73-4797-824e-87a1f5aea9e0',
  GEICO: '20202020-f517-42fd-80ae-14173b3b70ae',
  ALLSTATE: '20202020-eee1-4690-ad2c-8619e5b56a2e',
  LIBERTY_MUTUAL: '20202020-6784-4449-afdf-dc62cb8702f2',
};

export const seedCarriers = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'location',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_CARRIER_IDS.PROGRESSIVE,
        name: 'Progressive Insurance',
        domainNamePrimaryLinkUrl: 'https://www.progressive.com',
        location: 'Cleveland, OH',
        position: 0,
      },
      {
        id: DEV_SEED_CARRIER_IDS.STATE_FARM,
        name: 'State Farm',
        domainNamePrimaryLinkUrl: 'https://www.statefarm.com',
        location: 'Bloomington, IL',
        position: 1,
      },
      {
        id: DEV_SEED_CARRIER_IDS.GEICO,
        name: 'GEICO',
        domainNamePrimaryLinkUrl: 'https://www.geico.com',
        location: 'Indianapolis, IN',
        position: 2,
      },
      {
        id: DEV_SEED_CARRIER_IDS.ALLSTATE,
        name: 'Allstate Insurance',
        domainNamePrimaryLinkUrl: 'https://www.allstate.com',
        location: 'Chicago, IL',
        position: 3,
      },
      {
        id: DEV_SEED_CARRIER_IDS.LIBERTY_MUTUAL,
        name: 'Liberty Mutual Insurance',
        domainNamePrimaryLinkUrl: 'https://www.libertymutual.com',
        location: 'Indianapolis, IN',
        position: 4,
      },
    ])
    .execute();
};
