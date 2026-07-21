import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';

const eur = (amount: number) => ({
  amountMicros: amount * 1_000_000,
  currencyCode: 'EUR',
});

const AGENTS = [
  { firstName: 'Sophie', lastName: 'Bernard' },
  { firstName: 'Marc', lastName: 'Lefevre' },
];

const SELLERS = [
  { firstName: 'Claire', lastName: 'Dubois' },
  { firstName: 'Julien', lastName: 'Moreau' },
];

const BUYERS = [
  {
    firstName: 'Emma',
    lastName: 'Laurent',
    budgetMin: eur(300_000),
    budgetMax: eur(450_000),
    preApproved: true,
    desiredArea: 'Le Marais',
  },
  {
    firstName: 'Lucas',
    lastName: 'Martin',
    budgetMin: eur(500_000),
    budgetMax: eur(750_000),
    preApproved: false,
    desiredArea: 'Montmartre',
  },
  {
    firstName: 'Chloe',
    lastName: 'Petit',
    budgetMin: eur(250_000),
    budgetMax: eur(350_000),
    preApproved: true,
    desiredArea: 'Belleville',
  },
];

const handler = async () => {
  const client = new CoreApiClient();

  const peopleData = [
    ...AGENTS.map((p) => ({ name: p, personType: 'AGENT' })),
    ...SELLERS.map((p) => ({ name: p, personType: 'SELLER' })),
    ...BUYERS.map((p) => ({
      name: { firstName: p.firstName, lastName: p.lastName },
      personType: 'BUYER',
      budgetMin: p.budgetMin,
      budgetMax: p.budgetMax,
      preApproved: p.preApproved,
      desiredArea: p.desiredArea,
    })),
  ];

  const { createPeople } = (await client.mutation({
    createPeople: {
      __args: { data: peopleData as any },
      id: true,
      name: { firstName: true },
    },
  } as any)) as any;

  const personId = (firstName: string): string =>
    createPeople.find((person: any) => person.name?.firstName === firstName).id;

  const propertiesData = [
    {
      name: '12 Rue de Rivoli',
      propertyAddress: {
        addressStreet1: '12 Rue de Rivoli',
        addressCity: 'Paris',
        addressPostcode: '75001',
        addressCountry: 'France',
      },
      price: eur(420_000),
      status: 'ACTIVE',
      propertyType: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      surfaceSqm: 65,
      listingAgentId: personId('Sophie'),
      sellerContactId: personId('Claire'),
    },
    {
      name: '8 Avenue Montaigne',
      propertyAddress: {
        addressStreet1: '8 Avenue Montaigne',
        addressCity: 'Paris',
        addressPostcode: '75008',
        addressCountry: 'France',
      },
      price: eur(690_000),
      status: 'UNDER_OFFER',
      propertyType: 'CONDO',
      bedrooms: 3,
      bathrooms: 2,
      surfaceSqm: 95,
      listingAgentId: personId('Marc'),
      sellerContactId: personId('Julien'),
    },
    {
      name: '45 Rue des Martyrs',
      propertyAddress: {
        addressStreet1: '45 Rue des Martyrs',
        addressCity: 'Paris',
        addressPostcode: '75009',
        addressCountry: 'France',
      },
      price: eur(320_000),
      status: 'ACTIVE',
      propertyType: 'HOUSE',
      bedrooms: 4,
      bathrooms: 2,
      surfaceSqm: 120,
      listingAgentId: personId('Sophie'),
      sellerContactId: personId('Claire'),
    },
    {
      name: '3 Villa Leandre',
      propertyAddress: {
        addressStreet1: '3 Villa Leandre',
        addressCity: 'Paris',
        addressPostcode: '75018',
        addressCountry: 'France',
      },
      price: eur(850_000),
      status: 'COMING_SOON',
      propertyType: 'HOUSE',
      bedrooms: 5,
      bathrooms: 3,
      surfaceSqm: 160,
      listingAgentId: personId('Marc'),
      sellerContactId: personId('Julien'),
    },
  ];

  const { createProperties } = (await client.mutation({
    createProperties: {
      __args: { data: propertiesData as any },
      id: true,
      name: true,
    },
  } as any)) as any;

  const propertyId = (name: string): string =>
    createProperties.find((property: any) => property.name === name).id;

  const showingsData = [
    {
      name: '12 Rue de Rivoli / Laurent',
      scheduledAt: '2026-07-10T14:00:00.000Z',
      status: 'COMPLETED',
      interestLevel: 'RATING_4',
      propertyId: propertyId('12 Rue de Rivoli'),
      buyerId: personId('Emma'),
    },
    {
      name: '8 Avenue Montaigne / Martin',
      scheduledAt: '2026-07-12T11:00:00.000Z',
      status: 'COMPLETED',
      interestLevel: 'RATING_5',
      propertyId: propertyId('8 Avenue Montaigne'),
      buyerId: personId('Lucas'),
    },
    {
      name: '45 Rue des Martyrs / Petit',
      scheduledAt: '2026-08-05T10:00:00.000Z',
      status: 'SCHEDULED',
      propertyId: propertyId('45 Rue des Martyrs'),
      buyerId: personId('Chloe'),
    },
    {
      name: '45 Rue des Martyrs / Laurent',
      scheduledAt: '2026-07-15T16:00:00.000Z',
      status: 'COMPLETED',
      interestLevel: 'RATING_3',
      propertyId: propertyId('45 Rue des Martyrs'),
      buyerId: personId('Emma'),
    },
    {
      name: '3 Villa Leandre / Martin',
      scheduledAt: '2026-08-08T15:00:00.000Z',
      status: 'SCHEDULED',
      propertyId: propertyId('3 Villa Leandre'),
      buyerId: personId('Lucas'),
    },
  ];

  await client.mutation({
    createShowings: {
      __args: { data: showingsData as any },
      id: true,
    },
  } as any);

  const opportunitiesData = [
    {
      name: 'Rivoli - Laurent',
      stage: 'PROPOSAL',
      amount: eur(410_000),
      closeDate: '2026-09-15T00:00:00.000Z',
      pointOfContactId: personId('Emma'),
      propertyId: propertyId('12 Rue de Rivoli'),
    },
    {
      name: 'Montaigne - Martin',
      stage: 'CUSTOMER',
      amount: eur(680_000),
      closeDate: '2026-08-20T00:00:00.000Z',
      pointOfContactId: personId('Lucas'),
      propertyId: propertyId('8 Avenue Montaigne'),
    },
    {
      name: 'Leandre - Martin',
      stage: 'SCREENING',
      amount: eur(830_000),
      closeDate: '2026-10-30T00:00:00.000Z',
      pointOfContactId: personId('Lucas'),
      propertyId: propertyId('3 Villa Leandre'),
    },
  ];

  await client.mutation({
    createOpportunities: {
      __args: { data: opportunitiesData as any },
      id: true,
    },
  } as any);

  console.log(
    `Seeded ${peopleData.length} people, ${propertiesData.length} properties, ${showingsData.length} showings, ${opportunitiesData.length} opportunities.`,
  );

  return {};
};

export default definePostInstallLogicFunction({
  universalIdentifier: '8adff1aa-c3a5-41ba-8071-d86c1195ffd8',
  name: 'post-install',
  description: 'Seeds demo people, properties, showings and opportunities.',
  timeoutSeconds: 60,
  shouldRunSynchronously: true,
  handler,
});
