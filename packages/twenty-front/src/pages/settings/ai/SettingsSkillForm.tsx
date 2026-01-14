import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  H2Title,
  IconArchive,
  IconArchiveOff,
  IconInfoCircle,
  IconRefresh,
  IconTrash,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import {
  useActivateSkillMutation,
  useCreateSkillMutation,
  useDeactivateSkillMutation,
  useDeleteSkillMutation,
  useFindOneSkillQuery,
  useUpdateSkillMutation,
  type FindOneSkillQuery,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledAdvancedSettingsOuterContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.lg};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SkillFormValues = {
  name: string;
  label: string;
  description: string;
  content: string;
  icon: string;
  isLabelSyncedWithName: boolean;
};

const DELETE_SKILL_MODAL_ID = 'delete-skill-modal';

export const SettingsSkillForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const { skillId = '' } = useParams<{ skillId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadonlyMode, setIsReadonlyMode] = useState(false);
  const [originalFormValues, setOriginalFormValues] =
    useState<SkillFormValues | null>(null);
  const { openModal, closeModal } = useModal();

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const [formValues, setFormValues] = useState<SkillFormValues>({
    name: '',
    label: '',
    description: '',
    content: '',
    icon: 'IconSparkles',
    isLabelSyncedWithName: true,
  });

  const { data, loading } = useFindOneSkillQuery({
    variables: { id: skillId },
    skip: isCreateMode || !skillId,
    onCompleted: (data: FindOneSkillQuery) => {
      const skill = data?.skill;
      if (isDefined(skill)) {
        if (!skill.isCustom) {
          setIsReadonlyMode(true);
        }
        const computedNameFromLabel = computeMetadataNameFromLabel(skill.label);
        const isLabelSyncedWithName = skill.name === computedNameFromLabel;

        const initialValues: SkillFormValues = {
          name: skill.name,
          label: skill.label,
          description: skill.description ?? '',
          content: skill.content,
          icon: skill.icon ?? 'IconSparkles',
          isLabelSyncedWithName,
        };
        setFormValues(initialValues);
        setOriginalFormValues(initialValues);
      } else {
        enqueueErrorSnackBar({
          message: t`Skill not found`,
        });
        navigateApp(AppPath.NotFound);
      }
    },
    onError: (error: ApolloError) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
      navigateApp(AppPath.NotFound);
    },
  });

  const [createSkill] = useCreateSkillMutation();
  const [updateSkill] = useUpdateSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();
  const [activateSkill] = useActivateSkillMutation();
  const [deactivateSkill] = useDeactivateSkillMutation();

  const skill = data?.skill;

  const handleFieldChange = <K extends keyof SkillFormValues>(
    fieldName: K,
    value: SkillFormValues[K],
  ) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [fieldName]: value };

      if (fieldName === 'label' && prev.isLabelSyncedWithName) {
        newValues.name = computeMetadataNameFromLabel(value as string);
      }

      if (fieldName === 'isLabelSyncedWithName' && value === true) {
        newValues.name = computeMetadataNameFromLabel(prev.label);
      }

      return newValues;
    });
  };

  const validateForm = (): boolean => {
    return (
      formValues.name.trim().length > 0 &&
      formValues.label.trim().length > 0 &&
      formValues.content.trim().length > 0
    );
  };

  const autoSave = useDebouncedCallback(async () => {
    if (
      isCreateMode ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting ||
      !skill
    ) {
      return;
    }

    const hasChanges =
      originalFormValues && !isDeeplyEqual(formValues, originalFormValues);

    if (!hasChanges) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSkill({
        variables: {
          input: {
            id: skill.id,
            name: formValues.name,
            label: formValues.label,
            description: formValues.description || undefined,
            content: formValues.content,
            icon: formValues.icon || undefined,
          },
        },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  useEffect(() => {
    if (isEditMode && !loading && isDefined(originalFormValues)) {
      autoSave();
    }
  }, [formValues, isEditMode, loading, originalFormValues, autoSave]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  if (!isCreateMode && !loading && !skill) {
    return null;
  }

  const canSave = !isReadonlyMode && validateForm() && !isSubmitting;

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreateMode) {
        await createSkill({
          variables: {
            input: {
              name: formValues.name,
              label: formValues.label,
              description: formValues.description || undefined,
              content: formValues.content,
              icon: formValues.icon || undefined,
            },
          },
        });
        navigate(SettingsPath.AI);
        return;
      }

      if (!skill) {
        return;
      }

      await updateSkill({
        variables: {
          input: {
            id: skill.id,
            name: formValues.name,
            label: formValues.label,
            description: formValues.description || undefined,
            content: formValues.content,
            icon: formValues.icon || undefined,
          },
        },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!skill) return;

    setIsSubmitting(true);
    try {
      await deleteSkill({
        variables: { id: skill.id },
      });
      closeModal(DELETE_SKILL_MODAL_ID);
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!skill) return;

    setIsSubmitting(true);
    try {
      await deactivateSkill({
        variables: { id: skill.id },
      });
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!skill) return;

    setIsSubmitting(true);
    try {
      await activateSkill({
        variables: { id: skill.id },
      });
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormValues({
      name: '',
      label: '',
      description: '',
      content: '',
      icon: 'IconSparkles',
      isLabelSyncedWithName: true,
    });
    navigate(SettingsPath.AI);
  };

  const breadcrumbText = !isCreateMode
    ? loading
      ? t`Skill`
      : skill?.label
    : t`New Skill`;

  const isNameEditEnabled =
    !isReadonlyMode && !formValues.isLabelSyncedWithName;

  const apiNameTooltipText = formValues.isLabelSyncedWithName
    ? t`Deactivate "Synchronize Label and API Name" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

  const title = isCreateMode ? (
    t`New Skill`
  ) : loading ? (
    t`Skill`
  ) : (
    <StyledHeaderTitle>
      <TitleInput
        instanceId="skill-label-input"
        disabled={isReadonlyMode}
        sizeVariant="md"
        value={formValues.label}
        onChange={(value) => handleFieldChange('label', value)}
        placeholder={t`Skill name`}
      />
    </StyledHeaderTitle>
  );

  return (
    <SubMenuTopBarContainer
      title={title}
      actionButton={
        isCreateMode ? (
          <SaveAndCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isSaveDisabled={!canSave}
            isLoading={isSubmitting}
            isCancelDisabled={isSubmitting}
          />
        ) : undefined
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: breadcrumbText },
      ]}
    >
      <SettingsPageContainer>
        {isEditMode && loading ? (
          <Section>
            <Skeleton height={400} borderRadius={4} />
          </Section>
        ) : (
          <>
            <Section>
              <H2Title
                title={t`About`}
                description={t`Define the name and instructions for this skill`}
              />
              <StyledFormContainer>
                <StyledIconNameRow>
                  <IconPicker
                    selectedIconKey={formValues.icon || 'IconSparkles'}
                    onChange={({ iconKey }) =>
                      handleFieldChange('icon', iconKey)
                    }
                    disabled={isReadonlyMode}
                  />
                  <StyledNameContainer>
                    <SettingsTextInput
                      instanceId="skill-label-input"
                      placeholder={t`Skill name`}
                      value={formValues.label}
                      onChange={(value) => handleFieldChange('label', value)}
                      disabled={isReadonlyMode}
                      fullWidth
                    />
                  </StyledNameContainer>
                </StyledIconNameRow>

                <TextArea
                  textAreaId="skill-description-textarea"
                  placeholder={t`Write a description`}
                  minRows={3}
                  value={formValues.description}
                  onChange={(value) =>
                    handleFieldChange('description', value ?? '')
                  }
                  disabled={isReadonlyMode}
                />

                <FormAdvancedTextFieldInput
                  key={originalFormValues?.content ?? 'loading'}
                  label={t`Instructions`}
                  readonly={isReadonlyMode}
                  defaultValue={formValues.content}
                  contentType="markdown"
                  onChange={(content: string) =>
                    handleFieldChange('content', content)
                  }
                  enableFullScreen={true}
                  fullScreenBreadcrumbs={[
                    {
                      children: formValues.label || t`Skill`,
                      href: '#',
                    },
                    {
                      children: t`Instructions Editor`,
                    },
                  ]}
                  minHeight={300}
                  maxWidth={700}
                />

                <AdvancedSettingsWrapper hideDot>
                  <StyledAdvancedSettingsOuterContainer>
                    <StyledAdvancedSettingsContainer>
                      <SettingsTextInput
                        instanceId="skill-api-name"
                        label={t`API Name`}
                        placeholder={t`mySkill`}
                        value={formValues.name}
                        onChange={(value) => handleFieldChange('name', value)}
                        disabled={!isNameEditEnabled}
                        fullWidth
                        RightIcon={() =>
                          apiNameTooltipText && (
                            <>
                              <IconInfoCircle
                                id="info-circle-id-skill-name"
                                size={theme.icon.size.md}
                                color={theme.font.color.tertiary}
                                style={{ outline: 'none' }}
                              />
                              <AppTooltip
                                anchorSelect="#info-circle-id-skill-name"
                                content={apiNameTooltipText}
                                offset={5}
                                noArrow
                                place="bottom"
                                positionStrategy="fixed"
                                delay={TooltipDelay.shortDelay}
                              />
                            </>
                          )
                        }
                      />
                      <Card rounded>
                        <SettingsOptionCardContentToggle
                          Icon={IconRefresh}
                          title={t`Synchronize Label and API Name`}
                          description={t`Should changing the label also change the API name?`}
                          checked={formValues.isLabelSyncedWithName}
                          disabled={isReadonlyMode}
                          advancedMode
                          onChange={(value) =>
                            handleFieldChange('isLabelSyncedWithName', value)
                          }
                        />
                      </Card>
                    </StyledAdvancedSettingsContainer>
                  </StyledAdvancedSettingsOuterContainer>
                </AdvancedSettingsWrapper>
              </StyledFormContainer>
            </Section>

            {skill && (
              <Section>
                <H2Title
                  title={t`Danger zone`}
                  description={t`Deactivate or delete this skill`}
                />
                <StyledDangerButtonsContainer>
                  <Button
                    Icon={skill.isActive ? IconArchive : IconArchiveOff}
                    title={skill.isActive ? t`Deactivate` : t`Activate`}
                    size="small"
                    onClick={skill.isActive ? handleDeactivate : handleActivate}
                  />
                  {skill.isCustom && (
                    <Button
                      Icon={IconTrash}
                      title={t`Delete`}
                      size="small"
                      accent="danger"
                      variant="secondary"
                      onClick={() => openModal(DELETE_SKILL_MODAL_ID)}
                    />
                  )}
                </StyledDangerButtonsContainer>
              </Section>
            )}
          </>
        )}
      </SettingsPageContainer>

      <ConfirmationModal
        modalId={DELETE_SKILL_MODAL_ID}
        title={t`Delete Skill`}
        subtitle={t`Are you sure you want to delete this skill? This action cannot be undone.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        loading={isSubmitting}
      />
    </SubMenuTopBarContainer>
  );
};
