import { sortApplicationRegistrationsForAdmin } from 'src/engine/core-modules/application/application-registration/utils/sort-application-registrations-for-admin.util';

const buildRegistration = ({
  id,
  name = id,
  universalIdentifier = id,
  sourcePackage = null,
  isListed = false,
}: {
  id: string;
  name?: string;
  universalIdentifier?: string;
  sourcePackage?: string | null;
  isListed?: boolean;
}) => ({ id, name, universalIdentifier, sourcePackage, isListed });

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
  it('puts registrations missing configuration before configured ones', () => {
    const registrations = [
      buildRegistration({ id: 'configured' }),
      buildRegistration({ id: 'not-configured' }),
    ];

    expect(sortedIds(registrations, { configuredIds: ['configured'] })).toEqual(
      ['not-configured', 'configured'],
    );
  });

  it('puts listed registrations first', () => {
    const registrations = [
      buildRegistration({ id: 'not-listed' }),
      buildRegistration({ id: 'listed', isListed: true }),
    ];

    expect(sortedIds(registrations)).toEqual(['listed', 'not-listed']);
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

  it('applies listed, configuration, provenance, then installs', () => {
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
    ];

    expect(
      sortedIds(registrations, {
        configuredIds: [
          'community-configured-listed',
          'community-configured-unlisted',
          'twenty-configured-unlisted',
        ],
        installCounts: { 'community-configured-listed': 10 },
      }),
    ).toEqual([
      'community-not-configured',
      'community-configured-listed',
      'twenty-configured-unlisted',
      'community-configured-unlisted',
    ]);
  });

  it('does not mutate the input array', () => {
    const registrations = [
      buildRegistration({ id: 'listed', isListed: true }),
      buildRegistration({ id: 'not-listed' }),
    ];

    sortApplicationRegistrationsForAdmin({
      registrations,
      isConfiguredByRegistrationId: new Map(),
      installCountByRegistrationId: new Map(),
    });

    expect(registrations.map((registration) => registration.id)).toEqual([
      'listed',
      'not-listed',
    ]);
  });
});
