import { sortApplicationRegistrationsForAdmin } from 'src/engine/core-modules/application/application-registration/utils/sort-application-registrations-for-admin.util';

const buildRegistration = ({
  id,
  name = id,
  universalIdentifier = id,
  sourcePackage = null,
  isVetted = false,
  isListed = false,
}: {
  id: string;
  name?: string;
  universalIdentifier?: string;
  sourcePackage?: string | null;
  isVetted?: boolean;
  isListed?: boolean;
}) => ({ id, name, universalIdentifier, sourcePackage, isVetted, isListed });

const sortedIds = (
  registrations: ReturnType<typeof buildRegistration>[],
  {
    configuredIds = registrations.map((registration) => registration.id),
    installCounts = {},
  }: {
    configuredIds?: string[];
    installCounts?: Record<string, number>;
  } = {},
) =>
  sortApplicationRegistrationsForAdmin({
    registrations,
    isConfiguredByRegistrationId: new Map(
      registrations.map((registration) => [
        registration.id,
        configuredIds.includes(registration.id),
      ]),
    ),
    installCountByRegistrationId: new Map(Object.entries(installCounts)),
  }).map((registration) => registration.id);

describe('sortApplicationRegistrationsForAdmin', () => {
  it('puts vetted registrations first', () => {
    const registrations = [
      buildRegistration({ id: 'community' }),
      buildRegistration({ id: 'vetted', isVetted: true }),
    ];

    expect(sortedIds(registrations)).toEqual(['vetted', 'community']);
  });

  it('puts registrations missing configuration before configured ones', () => {
    const registrations = [
      buildRegistration({ id: 'configured' }),
      buildRegistration({ id: 'not-configured' }),
    ];

    expect(sortedIds(registrations, { configuredIds: ['configured'] })).toEqual(
      ['not-configured', 'configured'],
    );
  });

  it('puts listed registrations last', () => {
    const registrations = [
      buildRegistration({ id: 'listed', isListed: true }),
      buildRegistration({ id: 'not-listed' }),
    ];

    expect(sortedIds(registrations)).toEqual(['not-listed', 'listed']);
  });

  it('puts packages published by Twenty before community ones', () => {
    const registrations = [
      buildRegistration({ id: 'community', sourcePackage: 'twenty-app-acme' }),
      buildRegistration({ id: 'unpackaged' }),
      buildRegistration({ id: 'twenty', sourcePackage: '@twentyhq/slack' }),
    ];

    expect(sortedIds(registrations)).toEqual([
      'twenty',
      'community',
      'unpackaged',
    ]);
  });

  it('orders by install count, then name, then universal identifier', () => {
    const registrations = [
      buildRegistration({
        id: 'b-same-name',
        name: 'Same',
        universalIdentifier: 'b',
      }),
      buildRegistration({ id: 'zebra', name: 'zebra' }),
      buildRegistration({
        id: 'a-same-name',
        name: 'same',
        universalIdentifier: 'a',
      }),
      buildRegistration({ id: 'popular', name: 'Popular' }),
    ];

    expect(sortedIds(registrations, { installCounts: { popular: 3 } })).toEqual(
      ['popular', 'a-same-name', 'b-same-name', 'zebra'],
    );
  });

  it('applies vetted, configuration, listed, provenance, then installs', () => {
    const registrations = [
      buildRegistration({ id: 'community-configured-listed', isListed: true }),
      buildRegistration({ id: 'community-configured-unlisted' }),
      buildRegistration({
        id: 'community-not-configured',
        isListed: true,
      }),
      buildRegistration({
        id: 'twenty-configured-unlisted',
        sourcePackage: '@twentyhq/linear',
      }),
      buildRegistration({
        id: 'vetted-configured-listed',
        isVetted: true,
        isListed: true,
      }),
      buildRegistration({
        id: 'vetted-configured-unlisted',
        isVetted: true,
      }),
      buildRegistration({ id: 'vetted-not-configured', isVetted: true }),
    ];

    expect(
      sortedIds(registrations, {
        configuredIds: [
          'community-configured-listed',
          'community-configured-unlisted',
          'twenty-configured-unlisted',
          'vetted-configured-listed',
          'vetted-configured-unlisted',
        ],
        installCounts: { 'community-configured-listed': 10 },
      }),
    ).toEqual([
      'vetted-not-configured',
      'vetted-configured-unlisted',
      'vetted-configured-listed',
      'community-not-configured',
      'twenty-configured-unlisted',
      'community-configured-unlisted',
      'community-configured-listed',
    ]);
  });

  it('does not mutate the input array', () => {
    const registrations = [
      buildRegistration({ id: 'community' }),
      buildRegistration({ id: 'vetted', isVetted: true }),
    ];

    sortApplicationRegistrationsForAdmin({
      registrations,
      isConfiguredByRegistrationId: new Map(),
      installCountByRegistrationId: new Map(),
    });

    expect(registrations.map((registration) => registration.id)).toEqual([
      'community',
      'vetted',
    ]);
  });
});
