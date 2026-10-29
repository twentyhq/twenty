import { getWorkspaceApplicationStatusById } from '@/settings/applications/utils/getWorkspaceApplicationStatusById';
import {
  ApplicationRegistrationSourceType,
  ApplicationVariableScope,
} from '~/generated-metadata/graphql';

const APPLICATION_ID = 'acme-application-id';

const buildVariable = (
  overrides: Partial<{
    key: string;
    value: string;
    isRequired: boolean;
    isDeprecated: boolean;
    scope: ApplicationVariableScope;
  }> = {},
) => ({
  key: 'API_KEY',
  label: 'API key',
  value: '',
  isRequired: true,
  isDeprecated: false,
  scope: ApplicationVariableScope.WORKSPACE,
  ...overrides,
});

const getStatusById = ({
  sourceType = ApplicationRegistrationSourceType.NPM,
  latestAvailableVersion = '1.0.0',
  applicationVariables = [],
  applicationVariablesApplicationId = APPLICATION_ID,
}: {
  sourceType?: ApplicationRegistrationSourceType;
  latestAvailableVersion?: string;
  applicationVariables?: ReturnType<typeof buildVariable>[];
  applicationVariablesApplicationId?: string;
} = {}) =>
  getWorkspaceApplicationStatusById({
    applications: [
      {
        id: APPLICATION_ID,
        version: '1.0.0',
        applicationRegistration: { sourceType, latestAvailableVersion },
      },
    ],
    applicationsWithVariables: [
      { id: applicationVariablesApplicationId, applicationVariables },
    ],
  });

describe('getWorkspaceApplicationStatusById', () => {
  it('flags an app with a required workspace variable left empty', () => {
    expect(getStatusById({ applicationVariables: [buildVariable()] })).toEqual({
      [APPLICATION_ID]: { type: 'missingConfiguration' },
    });
  });

  it('counts a masked secret as filled', () => {
    expect(
      getStatusById({
        applicationVariables: [buildVariable({ value: '********' })],
      }),
    ).toEqual({});
  });

  it('ignores required variables each member fills in', () => {
    expect(
      getStatusById({
        applicationVariables: [
          buildVariable({ scope: ApplicationVariableScope.USER }),
        ],
      }),
    ).toEqual({});
  });

  it('ignores deprecated variables left empty', () => {
    expect(
      getStatusById({
        applicationVariables: [buildVariable({ isDeprecated: true })],
      }),
    ).toEqual({});
  });

  it('ignores variables that belong to another app', () => {
    expect(
      getStatusById({
        applicationVariables: [buildVariable()],
        applicationVariablesApplicationId: 'other-application-id',
      }),
    ).toEqual({});
  });

  it('flags an app behind its latest version', () => {
    expect(getStatusById({ latestAvailableVersion: '1.1.0' })).toEqual({
      [APPLICATION_ID]: { type: 'updateAvailable' },
    });
  });

  it('never flags an update for an app that cannot be upgraded', () => {
    expect(
      getStatusById({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        latestAvailableVersion: '1.1.0',
      }),
    ).toEqual({});
  });

  it('still flags an update while variables are unavailable', () => {
    expect(
      getWorkspaceApplicationStatusById({
        applications: [
          {
            id: APPLICATION_ID,
            version: '1.0.0',
            applicationRegistration: {
              sourceType: ApplicationRegistrationSourceType.NPM,
              latestAvailableVersion: '1.1.0',
            },
          },
        ],
      }),
    ).toEqual({ [APPLICATION_ID]: { type: 'updateAvailable' } });
  });

  it('shows missing configuration before an available update', () => {
    expect(
      getStatusById({
        latestAvailableVersion: '1.1.0',
        applicationVariables: [buildVariable()],
      }),
    ).toEqual({ [APPLICATION_ID]: { type: 'missingConfiguration' } });
  });
});
