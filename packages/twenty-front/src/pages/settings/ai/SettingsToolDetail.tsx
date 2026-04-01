import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useNavigate, useParams } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLogicFunctionLabelContainer } from '@/settings/logic-functions/components/SettingsLogicFunctionLabelContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  H2Title,
  IconCode,
  IconTrash,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import {
  GetToolIndexDocument,
  GetToolInputSchemaDocument,
} from '~/generated-metadata/graphql';

const DELETE_TOOL_MODAL_ID = 'delete-tool-modal';
const PARAMETER_TABLE_GRID = '160px 80px 90px 1fr';

const StyledTableHeaderRow = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescriptionCell = styled(TableCell)`
  align-items: flex-start;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SchemaProperty = {
  type?: string;
  description?: string;
  format?: string;
  items?: { type?: string };
};

const getDisplayType = (property: SchemaProperty): string => {
  if (property.format) {
    return property.format;
  }

  if (property.type === 'array' && property.items?.type) {
    return `${property.items.type}[]`;
  }

  return property.type ?? 'any';
};

export const SettingsToolDetail = () => {
  const { toolName, logicFunctionId } = useParams();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { updateLogicFunction, deleteLogicFunction } =
    usePersistLogicFunction();
  const { openModal } = useModal();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedName, setEditedName] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState<string | null>(
    null,
  );

  const isCustomTool = isDefined(logicFunctionId);

  const { logicFunction, loading: logicFunctionLoading } =
    useGetOneLogicFunction({
      id: logicFunctionId ?? '',
      skip: !isCustomTool,
    });

  const { data: toolIndexData, loading: toolIndexLoading } = useQuery(
    GetToolIndexDocument,
    { skip: isCustomTool },
  );

  const systemTool = toolIndexData?.getToolIndex.find(
    (entry) => entry.name === toolName,
  );

  const { data: schemaData, loading: schemaLoading } = useQuery(
    GetToolInputSchemaDocument,
    {
      variables: { toolName: toolName ?? '' },
      skip: isCustomTool || !isDefined(systemTool),
    },
  );

  const loading = isCustomTool
    ? logicFunctionLoading
    : toolIndexLoading || schemaLoading;

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const isManaged =
    isCustomTool &&
    isDefined(logicFunction?.applicationId) &&
    logicFunction.applicationId !== workspaceCustomApplicationId;

  const isReadOnly = !isCustomTool || isManaged;

  const name = isCustomTool ? logicFunction?.name : toolName;
  const description = isCustomTool
    ? logicFunction?.description
    : systemTool?.description;

  const inputSchema = isCustomTool
    ? logicFunction?.toolInputSchema
    : schemaData?.getToolInputSchema;

  const hasInputSchema =
    isDefined(inputSchema) && Object.keys(inputSchema).length > 0;

  const schemaProperties = (
    hasInputSchema ? inputSchema.properties : undefined
  ) as Record<string, SchemaProperty> | undefined;

  const requiredFields = (hasInputSchema ? inputSchema.required : undefined) as
    | string[]
    | undefined;

  const functionLink = isCustomTool
    ? isDefined(logicFunction?.applicationId)
      ? getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
          applicationId: logicFunction.applicationId,
          logicFunctionId: logicFunction?.id ?? '',
        })
      : getSettingsPath(SettingsPath.LogicFunctionDetail, {
          logicFunctionId: logicFunction?.id ?? '',
        })
    : undefined;

  const debouncedSaveName = useDebouncedCallback(async (value: string) => {
    if (!isCustomTool || !isDefined(logicFunction)) return;

    await updateLogicFunction({
      input: {
        id: logicFunction.id,
        update: { name: value },
      },
    });
  }, 1_000);

  const handleNameChange = (value: string) => {
    setEditedName(value);
    debouncedSaveName(value);
  };

  const debouncedSaveDescription = useDebouncedCallback(
    async (value: string) => {
      if (!isCustomTool || !isDefined(logicFunction)) return;

      await updateLogicFunction({
        input: {
          id: logicFunction.id,
          update: { description: value },
        },
      });
    },
    1_000,
  );

  const handleDescriptionChange = (value: string) => {
    setEditedDescription(value);
    debouncedSaveDescription(value);
  };

  const handleDelete = async () => {
    if (!isCustomTool || !isDefined(logicFunction)) return;

    setIsDeleting(true);

    const result = await deleteLogicFunction({
      input: { id: logicFunction.id },
    });

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Tool deleted` });
      navigate(getSettingsPath(SettingsPath.AI, undefined, undefined, 'tools'));
    }

    setIsDeleting(false);
  };

  return (
    <SubMenuTopBarContainer
      title={
        isCustomTool ? (
          <SettingsLogicFunctionLabelContainer
            value={editedName ?? name ?? ''}
            onChange={handleNameChange}
          />
        ) : (
          (name ?? '')
        )
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`AI`,
          href: getSettingsPath(SettingsPath.AI, undefined, undefined, 'tools'),
        },
        { children: editedName ?? name ?? '' },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Section>
              <Skeleton height={20} width={200} />
              <Skeleton height={20} width={400} />

              <Skeleton height={80} />
            </Section>
          </SkeletonTheme>
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Description`}
                description={t`Define what this tool does`}
              />
              <TextArea
                textAreaId="tool-description-textarea"
                placeholder={t`Write a description`}
                minRows={3}
                value={editedDescription ?? description ?? ''}
                onChange={handleDescriptionChange}
                disabled={isReadOnly}
              />
            </Section>
            <Section>
              <H2Title
                title={t`Parameters`}
                description={t`Input parameters accepted by this tool`}
              />
              {isDefined(schemaProperties) &&
              Object.keys(schemaProperties).length > 0 ? (
                <Table>
                  <StyledTableHeaderRow>
                    <TableRow gridTemplateColumns={PARAMETER_TABLE_GRID}>
                      <TableHeader>{t`Name`}</TableHeader>
                      <TableHeader>{t`Type`}</TableHeader>
                      <TableHeader>{t`Required`}</TableHeader>
                      <TableHeader>{t`Description`}</TableHeader>
                    </TableRow>
                  </StyledTableHeaderRow>
                  {Object.entries(schemaProperties).map(
                    ([paramName, property]) => (
                      <TableRow
                        key={paramName}
                        gridTemplateColumns={PARAMETER_TABLE_GRID}
                        hoverBackgroundColor={
                          themeCssVariables.background.transparent.light
                        }
                      >
                        <TableCell
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          <Tag text={paramName} color="gray" weight="medium" />
                        </TableCell>
                        <TableCell
                          color={themeCssVariables.font.color.secondary}
                          whiteSpace="nowrap"
                        >
                          {getDisplayType(property)}
                        </TableCell>
                        <TableCell>
                          {requiredFields?.includes(paramName) && (
                            <Tag text={t`required`} color="red" preventShrink />
                          )}
                        </TableCell>
                        <StyledDescriptionCell
                          color={themeCssVariables.font.color.tertiary}
                          height="auto"
                          minWidth="0"
                          overflow="hidden"
                        >
                          <OverflowingTextWithTooltip
                            text={property.description ?? ''}
                            displayedMaxRows={2}
                            isTooltipMultiline
                          />
                        </StyledDescriptionCell>
                      </TableRow>
                    ),
                  )}
                </Table>
              ) : (
                <div>{t`No parameters`}</div>
              )}
            </Section>
            {isCustomTool && isDefined(functionLink) && (
              <Section>
                <H2Title
                  title={t`Function`}
                  description={t`The logic function powering this tool`}
                />
                <UndecoratedLink to={functionLink}>
                  <SettingsCard
                    Icon={
                      <IconCode
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                      />
                    }
                    title={t`Open in editor`}
                  />
                </UndecoratedLink>
              </Section>
            )}
            {isCustomTool && !isManaged && (
              <Section>
                <H2Title
                  title={t`Danger zone`}
                  description={t`Delete this tool`}
                />
                <Button
                  Icon={IconTrash}
                  title={t`Delete`}
                  accent="danger"
                  size="small"
                  variant="secondary"
                  onClick={() => openModal(DELETE_TOOL_MODAL_ID)}
                />
              </Section>
            )}
          </>
        )}
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_TOOL_MODAL_ID}
        title={t`Delete Tool`}
        subtitle={t`Are you sure you want to delete this tool? This action cannot be undone.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        loading={isDeleting}
      />
    </SubMenuTopBarContainer>
  );
};
