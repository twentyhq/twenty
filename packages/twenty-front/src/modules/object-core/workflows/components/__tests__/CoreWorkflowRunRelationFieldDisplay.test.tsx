import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowRunRelationFieldDisplay } from '@/object-core/workflows/components/CoreWorkflowRunRelationFieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  CoreWorkflowStatus,
  CoreWorkflowVersionStatus,
  GetCoreWorkflowDocument,
  GetCoreWorkflowVersionsDocument,
  WorkflowVisibility,
} from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const WORKFLOW_RUN_ID = '20202020-0000-4000-8000-000000000001';
const CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000002';
const CORE_WORKFLOW_VERSION_ID = '20202020-0000-4000-8000-000000000003';

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
          lastPublishedCoreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
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
  {
    request: {
      query: GetCoreWorkflowVersionsDocument,
      variables: { coreWorkflowId: CORE_WORKFLOW_ID },
    },
    result: {
      data: {
        coreWorkflowVersions: [
          {
            __typename: 'CoreWorkflowVersionDTO',
            id: CORE_WORKFLOW_VERSION_ID,
            label: 'v2',
            status: CoreWorkflowVersionStatus.ACTIVE,
            coreWorkflowId: CORE_WORKFLOW_ID,
            createdAt: '2026-10-01T10:00:00.000Z',
          },
        ],
      },
    },
  },
];

const renderRelationField = ({
  fieldName,
  workflowRun,
}: {
  fieldName: 'workflow' | 'workflowVersion';
  workflowRun: Record<string, unknown>;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <FieldContext.Provider
          value={{
            recordId: WORKFLOW_RUN_ID,
            isLabelIdentifier: false,
            isRecordFieldReadOnly: true,
            fieldDefinition: {
              fieldMetadataId: `${fieldName}-field-metadata-id`,
              label: fieldName,
              iconName: 'IconSettingsAutomation',
              type: FieldMetadataType.RELATION,
              metadata: {
                fieldName,
                objectMetadataNameSingular: CoreObjectNameSingular.WorkflowRun,
              },
            },
          }}
        >
          <CoreWorkflowRunRelationFieldDisplay />
        </FieldContext.Provider>
      </MemoryRouter>
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        apolloMocks: APOLLO_MOCKS,
        onInitializeJotaiStore: (store) => {
          store.set(recordStoreFamilyState.atomFamily(WORKFLOW_RUN_ID), {
            __typename: 'WorkflowRun',
            id: WORKFLOW_RUN_ID,
            workflow: null,
            workflowVersion: null,
            ...workflowRun,
          });
        },
      }),
    },
  );

describe('CoreWorkflowRunRelationFieldDisplay', () => {
  it('should show the core workflow of a run without workspace workflow, linking to the core workflow page', async () => {
    renderRelationField({
      fieldName: 'workflow',
      workflowRun: {
        coreWorkflowId: CORE_WORKFLOW_ID,
        coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      },
    });

    const workflowLink = await screen.findByRole('link', {
      name: /Lead enrichment/,
    });

    expect(workflowLink).toHaveAttribute(
      'href',
      `/workflow/${CORE_WORKFLOW_ID}`,
    );
  });

  it('should show the core workflow version label of a run', async () => {
    renderRelationField({
      fieldName: 'workflowVersion',
      workflowRun: {
        coreWorkflowId: CORE_WORKFLOW_ID,
        coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
      },
    });

    expect(await screen.findByText('v2')).toBeInTheDocument();
  });

  it('should show nothing for a run without core workflow', () => {
    const { container } = renderRelationField({
      fieldName: 'workflow',
      workflowRun: { coreWorkflowId: null, coreWorkflowVersionId: null },
    });

    expect(container).toBeEmptyDOMElement();
  });
});
