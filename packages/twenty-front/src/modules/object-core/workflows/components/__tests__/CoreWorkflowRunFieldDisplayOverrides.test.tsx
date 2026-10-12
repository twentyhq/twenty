import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  CoreWorkflowStatus,
  GetCoreWorkflowDocument,
  WorkflowVisibility,
} from '~/generated/graphql';
import {
  FeatureFlagKey,
  FieldMetadataType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const WORKFLOW_RUN_ID = '20202020-0000-4000-8000-000000000001';
const CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000002';

const APOLLO_MOCKS = [
  {
    request: {
      query: GetCoreWorkflowDocument,
      variables: { coreWorkflowId: CORE_WORKFLOW_ID },
    },
    result: {
      data: {
        coreWorkflow: {
          __typename: 'CoreWorkflowDTO',
          id: CORE_WORKFLOW_ID,
          name: 'Lead enrichment',
          statuses: [CoreWorkflowStatus.ACTIVE],
          lastPublishedCoreWorkflowVersionId: null,
          applicationId: null,
          workspaceWorkflowId: null,
          visibility: WorkflowVisibility.WORKSPACE,
          canChangeVisibility: true,
          createdAt: '2026-10-01T10:00:00.000Z',
          updatedAt: '2026-10-01T10:00:00.000Z',
        },
      },
    },
  },
];

const renderWorkflowField = ({
  coreWorkflowId,
  isWorkflowCoreIndexPageEnabled = true,
}: {
  coreWorkflowId: string | null;
  isWorkflowCoreIndexPageEnabled?: boolean;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <PreComputedChipGeneratorsContext.Provider
          value={{
            chipGeneratorPerObjectPerField: {},
            identifierChipGeneratorPerObject: {},
          }}
        >
          <FieldContext.Provider
            value={{
              recordId: WORKFLOW_RUN_ID,
              isLabelIdentifier: false,
              isRecordFieldReadOnly: true,
              fieldDefinition: {
                fieldMetadataId: 'workflow-field-metadata-id',
                label: 'Workflow',
                iconName: 'IconSettingsAutomation',
                type: FieldMetadataType.RELATION,
                metadata: {
                  fieldName: 'workflow',
                  objectMetadataNameSingular:
                    CoreObjectNameSingular.WorkflowRun,
                  relationFieldMetadataId: 'runs-field-metadata-id',
                  relationObjectMetadataId: 'workflow-object-metadata-id',
                  relationObjectMetadataNameSingular: 'workflow',
                  relationObjectMetadataNamePlural: 'workflows',
                },
              },
            }}
          >
            <FieldDisplay />
          </FieldContext.Provider>
        </PreComputedChipGeneratorsContext.Provider>
      </MemoryRouter>
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        apolloMocks: APOLLO_MOCKS,
        onInitializeJotaiStore: (store) => {
          store.set(currentWorkspaceState.atom, {
            featureFlags: [
              {
                key: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
                value: isWorkflowCoreIndexPageEnabled,
              },
            ],
          } as CurrentWorkspace);
          store.set(recordStoreFamilyState.atomFamily(WORKFLOW_RUN_ID), {
            __typename: 'WorkflowRun',
            id: WORKFLOW_RUN_ID,
            workflow: null,
            coreWorkflowId,
          });
        },
      }),
    },
  );

describe('CORE_WORKFLOW_RUN_FIELD_DISPLAY_OVERRIDES', () => {
  it('should show the core workflow of a run without workspace workflow, linking to the core workflow page', async () => {
    renderWorkflowField({ coreWorkflowId: CORE_WORKFLOW_ID });

    const workflowLink = await screen.findByRole('link', {
      name: /Lead enrichment/,
    });

    expect(workflowLink).toHaveAttribute(
      'href',
      `/workflow/${CORE_WORKFLOW_ID}`,
    );
  });

  it('should show nothing for a core-only run when the flag is off', async () => {
    const { container } = renderWorkflowField({
      coreWorkflowId: CORE_WORKFLOW_ID,
      isWorkflowCoreIndexPageEnabled: false,
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(container).toBeEmptyDOMElement();
  });

  it('should show nothing for a run without core workflow', () => {
    const { container } = renderWorkflowField({ coreWorkflowId: null });

    expect(container).toBeEmptyDOMElement();
  });
});
