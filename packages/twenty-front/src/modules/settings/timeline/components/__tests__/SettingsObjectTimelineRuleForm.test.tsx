import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectTimelineRuleForm } from '@/settings/timeline/components/SettingsObjectTimelineRuleForm';
import { updateTimelineProjectionRule } from '@/settings/timeline/graphql/mutations/updateTimelineProjectionRule';
import { getTimelineProjectionRules } from '@/settings/timeline/graphql/queries/getTimelineProjectionRules';
import { type TimelineProjectionRule } from '@/settings/timeline/types/TimelineProjectionRule';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockNavigate = jest.fn();

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigate,
}));

const metadata = getTestEnrichedObjectMetadataItemsMock();

const findObject = (nameSingular: string): EnrichedObjectMetadataItem => {
  const objectMetadataItem = metadata.find(
    (item) => item.nameSingular === nameSingular,
  );

  if (objectMetadataItem === undefined) {
    throw new Error(`Missing ${nameSingular} in metadata mock`);
  }

  return objectMetadataItem;
};

const company = findObject('company');
const person = findObject('person');
const note = findObject('note');
const task = findObject('task');

const renderForm = ({
  rule,
  mocks,
}: {
  rule?: TimelineProjectionRule;
  mocks: readonly MockedResponse<Record<string, any>, Record<string, any>>[];
}) => {
  resetJotaiStore();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <MockedProvider mocks={mocks}>
        <JotaiProvider store={jotaiStore}>
          <ThemeProvider colorScheme="light">
            <I18nProvider i18n={i18n}>
              <SnackBarComponentInstanceContext.Provider
                value={{ instanceId: 'snack-bar-manager' }}
              >
                <JestObjectMetadataItemSetter>
                  {children}
                </JestObjectMetadataItemSetter>
              </SnackBarComponentInstanceContext.Provider>
            </I18nProvider>
          </ThemeProvider>
        </JotaiProvider>
      </MockedProvider>
    </MemoryRouter>
  );

  return render(
    <SettingsObjectTimelineRuleForm objectMetadataItem={company} rule={rule} />,
    { wrapper: Wrapper },
  );
};

describe('SettingsObjectTimelineRuleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create screen with activities pre-selected and saving blocked until a source is chosen', async () => {
    renderForm({
      mocks: [
        {
          request: { query: getTimelineProjectionRules },
          result: { data: { getTimelineProjectionRules: [] } },
        },
      ],
    });

    expect((await screen.findAllByText('New rule')).length).toBeGreaterThan(0);
    expect(screen.getByText('Inherits from')).toBeInTheDocument();
    expect(screen.getByText(note.labelPlural)).toBeInTheDocument();
    expect(screen.getByText(task.labelPlural)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('updates an existing rule and navigates back to the object on save', async () => {
    const rule: TimelineProjectionRule = {
      id: 'rule-1',
      anchorObjectMetadataId: company.id,
      sourceObjectMetadataId: person.id,
      linkedObjectMetadataIds: [note.id, task.id],
    };

    const updatedInput = {
      id: rule.id,
      anchorObjectMetadataId: company.id,
      sourceObjectMetadataId: person.id,
      linkedObjectMetadataIds: [note.id, task.id],
    };

    const rulesQueryMock = {
      request: { query: getTimelineProjectionRules },
      result: { data: { getTimelineProjectionRules: [rule] } },
    };

    renderForm({
      rule,
      mocks: [
        rulesQueryMock,
        rulesQueryMock,
        {
          request: {
            query: updateTimelineProjectionRule,
            variables: { input: updatedInput },
          },
          result: {
            data: { updateTimelineProjectionRule: updatedInput },
          },
        },
      ],
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(SettingsPath.ObjectDetail, {
        objectNamePlural: company.namePlural,
      }),
    );
  });
});
