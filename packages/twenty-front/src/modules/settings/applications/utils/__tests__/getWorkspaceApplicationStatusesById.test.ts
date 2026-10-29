import { getWorkspaceApplicationStatusesById } from '@/settings/applications/utils/getWorkspaceApplicationStatusesById';
import {
  ApplicationRegistrationSourceType,
  type ApplicationRegistrationSummary,
  type ApplicationVariable,
  ApplicationVariableScope,
} from '~/generated-metadata/graphql';

const APPLICATION_ID = 'acme-application-id';

type ApplicationRegistrationOverrides = Partial<
  Pick<ApplicationRegistrationSummary, 'sourceType' | 'latestAvailableVersion'>
>;

const buildVariable = (
  overrides: Partial<
    Pick<
      ApplicationVariable,
      'key' | 'value' | 'isRequired' | 'isDeprecated' | 'scope'
    >
  > = {},
) => ({
  key: 'API_KEY',
  label: 'API key',
  value: '',
  isRequired: true,
  isDeprecated: false,
  scope: ApplicationVariableScope.WORKSPACE,
  ...overrides,
});

const buildApplication = ({
  sourceType = ApplicationRegistrationSourceType.NPM,
  latestAvailableVersion = '1.0.0',
}: ApplicationRegistrationOverrides = {}) => ({
  id: APPLICATION_ID,
  version: '1.0.0',
  applicationRegistration: { sourceType, latestAvailableVersion },
});

const getStatusesById = ({
  sourceType,
  latestAvailableVersion,
  applicationVariables = [],
  applicationVariablesApplicationId = APPLICATION_ID,
}: ApplicationRegistrationOverrides & {
  applicationVariables?: ReturnType<typeof buildVariable>[];
  applicationVariablesApplicationId?: string;
} = {}) =>
  getWorkspaceApplicationStatusesById({
    applications: [buildApplication({ sourceType, latestAvailableVersion })],
    applicationsWithVariables: [
      { id: applicationVariablesApplicationId, applicationVariables },
    ],
  });

describe('getWorkspaceApplicationStatusesById', () => {
  it('flags an app with a required workspace variable left empty', () => {
    expect(
      getStatusesById({ applicationVariables: [buildVariable()] }),
    ).toEqual({
      [APPLICATION_ID]: [{ type: 'missingConfiguration' }],
    });
  });

  it('counts a masked secret as filled', () => {
    expect(
      getStatusesById({
        applicationVariables: [buildVariable({ value: '********' })],
      }),
    ).toEqual({});
  });

  it('ignores required variables each member fills in', () => {
    expect(
      getStatusesById({
        applicationVariables: [
          buildVariable({ scope: ApplicationVariableScope.USER }),
        ],
      }),
    ).toEqual({});
  });

  it('ignores deprecated variables left empty', () => {
    expect(
      getStatusesById({
        applicationVariables: [buildVariable({ isDeprecated: true })],
      }),
    ).toEqual({});
  });

  it('ignores variables that belong to another app', () => {
    expect(
      getStatusesById({
        applicationVariables: [buildVariable()],
        applicationVariablesApplicationId: 'other-application-id',
      }),
    ).toEqual({});
  });

  it('flags an app behind its latest version', () => {
    expect(getStatusesById({ latestAvailableVersion: '1.1.0' })).toEqual({
      [APPLICATION_ID]: [{ type: 'updateAvailable' }],
    });
  });

  it('never flags an update for an app that cannot be upgraded', () => {
    expect(
      getStatusesById({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        latestAvailableVersion: '1.1.0',
      }),
    ).toEqual({});
  });

  it('still flags an update while variables are not loaded', () => {
    expect(
      getWorkspaceApplicationStatusesById({
        applications: [buildApplication({ latestAvailableVersion: '1.1.0' })],
      }),
    ).toEqual({ [APPLICATION_ID]: [{ type: 'updateAvailable' }] });
  });

  it('reports both missing configuration and an available update', () => {
    expect(
      getStatusesById({
        latestAvailableVersion: '1.1.0',
        applicationVariables: [buildVariable()],
      }),
    ).toEqual({
      [APPLICATION_ID]: [
        { type: 'missingConfiguration' },
        { type: 'updateAvailable' },
      ],
    });
  });
});
