import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { BuyerStage } from '../fields/opportunity-buyer-stage.field';

const eur = (amount: number) => ({
  amountMicros: amount * 1_000_000,
  currencyCode: 'EUR',
});

const FIRST = [
  'Emma', 'Lucas', 'Chloe', 'Louis', 'Jade', 'Hugo', 'Lea', 'Nathan',
  'Manon', 'Enzo', 'Camille', 'Gabriel', 'Sarah', 'Raphael', 'Ines',
  'Arthur', 'Zoe', 'Paul', 'Julie', 'Adam', 'Alice', 'Theo', 'Lina',
  'Noah', 'Eva', 'Tom', 'Rose', 'Sacha', 'Nina', 'Leo',
];
const LAST = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefevre', 'Michel',
  'Garcia',
];
const lastFor = (i: number) => LAST[i % LAST.length];

const AGENT_COUNT = 4;
const SELLER_COUNT = 12;
const BUYER_COUNT = 12;
const PROPERTY_COUNT = 30;

const agentFirst = FIRST.slice(0, AGENT_COUNT);
const sellerFirst = FIRST.slice(AGENT_COUNT, AGENT_COUNT + SELLER_COUNT);
const buyerFirst = FIRST.slice(
  AGENT_COUNT + SELLER_COUNT,
  AGENT_COUNT + SELLER_COUNT + BUYER_COUNT,
);

const AREAS = [
  'Le Marais', 'Montmartre', 'Belleville', 'Bastille', 'Latin Quarter',
  'Saint-Germain', 'Canal Saint-Martin', 'Batignolles', 'Butte-aux-Cailles',
  'Pigalle', 'Oberkampf', 'Nation',
];
const STREETS = [
  'Rue de Rivoli', 'Avenue Montaigne', 'Rue des Martyrs', 'Villa Leandre',
  'Boulevard Haussmann', 'Rue Oberkampf', 'Rue du Bac', 'Avenue Foch',
  'Rue de la Pompe', 'Quai de Valmy', 'Rue Lepic', 'Cours Mirabeau',
];
const CITIES: [string, string][] = [
  ['Paris', '75001'], ['Paris', '75008'], ['Lyon', '69002'],
  ['Bordeaux', '33000'], ['Marseille', '13001'], ['Nice', '06000'],
];
const TYPES = ['APARTMENT', 'HOUSE', 'CONDO', 'LAND'];
const STATUSES = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'UNDER_OFFER', 'COMING_SOON', 'SOLD'];
const SHOWING_STATUSES = ['COMPLETED', 'SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
const BUYER_STAGE_CYCLE = [
  BuyerStage.COMPLETING_PROFILE,
  BuyerStage.SHOWING,
  BuyerStage.OFFER_MADE,
  BuyerStage.CLOSING,
  BuyerStage.WON,
  BuyerStage.LOST,
];

const STANDARD_STAGE_BY_BUYER_STAGE: Record<BuyerStage, string> = {
  [BuyerStage.COMPLETING_PROFILE]: 'NEW',
  [BuyerStage.SHOWING]: 'SCREENING',
  [BuyerStage.OFFER_MADE]: 'PROPOSAL',
  [BuyerStage.CLOSING]: 'PROPOSAL',
  [BuyerStage.WON]: 'CUSTOMER',
  [BuyerStage.LOST]: 'NEW',
};

const handler = async () => {
  const client = new CoreApiClient();

  const peopleData = [
    ...agentFirst.map((firstName, i) => ({
      name: { firstName, lastName: lastFor(i) },
      personType: 'AGENT',
    })),
    ...sellerFirst.map((firstName, i) => ({
      name: { firstName, lastName: lastFor(AGENT_COUNT + i) },
      personType: 'SELLER',
    })),
    ...buyerFirst.map((firstName, b) => ({
      name: { firstName, lastName: lastFor(AGENT_COUNT + SELLER_COUNT + b) },
      personType: 'BUYER',
      budgetMin: eur(200_000 + b * 40_000),
      budgetMax: eur(200_000 + b * 40_000 + 150_000 + (b % 3) * 50_000),
      preApproved: b % 2 === 0,
      desiredArea: AREAS[b % AREAS.length],
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

  const propertyMeta = Array.from({ length: PROPERTY_COUNT }, (_, i) => {
    const [city, postcode] = CITIES[i % CITIES.length];
    const street = STREETS[i % STREETS.length];
    const number = 3 + i * 7;
    return {
      name: `${number} ${street}`,
      number,
      street,
      city,
      postcode,
      priceEur: 180_000 + i * 38_000 + (i % 3) * 15_000,
      status: STATUSES[i % STATUSES.length],
      propertyType: TYPES[i % TYPES.length],
      bedrooms: 1 + (i % 5),
      bathrooms: 1 + (i % 3),
      surfaceSqm: 42 + i * 4,
      agentFirst: agentFirst[i % AGENT_COUNT],
      sellerFirst: sellerFirst[i % SELLER_COUNT],
    };
  });

  const propertiesData = propertyMeta.map((m) => ({
    name: m.name,
    propertyAddress: {
      addressStreet1: `${m.number} ${m.street}`,
      addressCity: m.city,
      addressPostcode: m.postcode,
      addressCountry: 'France',
    },
    price: eur(m.priceEur),
    status: m.status,
    propertyType: m.propertyType,
    bedrooms: m.bedrooms,
    bathrooms: m.bathrooms,
    surfaceSqm: m.surfaceSqm,
    listingAgentId: personId(m.agentFirst),
    sellerContactId: personId(m.sellerFirst),
  }));

  const { createProperties } = (await client.mutation({
    createProperties: {
      __args: { data: propertiesData as any },
      id: true,
      name: true,
    },
  } as any)) as any;

  const propertyId = (name: string): string =>
    createProperties.find((property: any) => property.name === name).id;

  // One opportunity per buyer: the buyer's pipeline card, staged by buyerStage.
  const opportunitiesData = buyerFirst.map((firstName, b) => {
    const buyerStage = BUYER_STAGE_CYCLE[b % BUYER_STAGE_CYCLE.length];
    const meta = propertyMeta[(b * 2) % PROPERTY_COUNT];
    return {
      name: `${firstName} ${lastFor(AGENT_COUNT + SELLER_COUNT + b)}`,
      buyerStage,
      stage: STANDARD_STAGE_BY_BUYER_STAGE[buyerStage],
      amount: eur(Math.round(meta.priceEur * 0.97)),
      closeDate: `2026-${String(9 + (b % 3)).padStart(2, '0')}-15T00:00:00.000Z`,
      buyerId: personId(firstName),
      sellerId: personId(meta.sellerFirst),
      propertyId: propertyId(meta.name),
    };
  });

  const { createOpportunities } = (await client.mutation({
    createOpportunities: {
      __args: { data: opportunitiesData as any },
      id: true,
      name: true,
    },
  } as any)) as any;

  const opportunityId = (name: string): string =>
    createOpportunities.find((opportunity: any) => opportunity.name === name).id;

  const showingsData = buyerFirst.flatMap((firstName, b) => {
    const opportunityName = `${firstName} ${lastFor(AGENT_COUNT + SELLER_COUNT + b)}`;
    return [0, 1].map((k) => {
      const propertyIndex = (b * 2 + k * 11) % PROPERTY_COUNT;
      const meta = propertyMeta[propertyIndex];
      const status = SHOWING_STATUSES[(b + k) % SHOWING_STATUSES.length];
      const month = 7 + ((b + k) % 2);
      const day = String(3 + ((b * 3 + k) % 25)).padStart(2, '0');
      return {
        name: `${meta.name} / ${lastFor(AGENT_COUNT + SELLER_COUNT + b)}`,
        status,
        scheduledAt: `2026-0${month}-${day}T1${k + 2}:00:00.000Z`,
        propertyId: propertyId(meta.name),
        buyerId: personId(firstName),
        agentId: personId(meta.agentFirst),
        opportunityId: opportunityId(opportunityName),
        ...(status === 'COMPLETED'
          ? { interestLevel: `RATING_${2 + ((b + k) % 4)}` }
          : {}),
      };
    });
  });

  await client.mutation({
    createShowings: {
      __args: { data: showingsData as any },
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
  timeoutSeconds: 120,
  shouldRunSynchronously: true,
  handler,
});
