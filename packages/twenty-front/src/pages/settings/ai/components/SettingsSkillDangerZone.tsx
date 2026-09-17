import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconArchive, IconArchiveOff, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  ActivateSkillDocument,
  DeactivateSkillDocument,
  DeleteSkillDocument,
  type FindOneSkillQuery,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const DELETE_SKILL_MODAL_ID = 'delete-skill-modal';

type SettingsSkillDangerZoneProps = {
  skill: Pick<
    NonNullable<FindOneSkillQuery['skill']>,
    'id' | 'isActive' | 'isCustom'
  >;
};

export const SettingsSkillDangerZone = ({
  skill,
}: SettingsSkillDangerZoneProps) => {
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { openModal, closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteSkill] = useMutation(DeleteSkillDocument);
  const [activateSkill] = useMutation(ActivateSkillDocument);
  const [deactivateSkill] = useMutation(DeactivateSkillDocument);

  const runAndLeave = async (mutation: () => Promise<unknown>) => {
    setIsSubmitting(true);
    try {
      await mutation();
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () =>
    runAndLeave(async () => {
      await deleteSkill({ variables: { id: skill.id } });
      closeModal(DELETE_SKILL_MODAL_ID);
    });

  const handleToggleActive = () =>
    runAndLeave(() =>
      skill.isActive
        ? deactivateSkill({ variables: { id: skill.id } })
        : activateSkill({ variables: { id: skill.id } }),
    );

  return (
    <Section.Root>
      <Section.Header
        title={t`Danger zone`}
        description={t`Deactivate or delete this skill`}
      />
      <StyledDangerButtonsContainer>
        <Button
          startIcon={skill.isActive ? <IconArchive /> : <IconArchiveOff />}
          size="sm"
          onClick={handleToggleActive}
        >
          {skill.isActive ? t`Deactivate` : t`Activate`}
        </Button>
        {skill.isCustom && (
          <Button
            startIcon={<IconTrash />}
            size="sm"
            onClick={() => openModal(DELETE_SKILL_MODAL_ID)}
            variant="outline"
            color="danger"
          >{t`Delete`}</Button>
        )}
      </StyledDangerButtonsContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_SKILL_MODAL_ID}
        title={t`Delete Skill`}
        subtitle={t`Are you sure you want to delete this skill? This action cannot be undone.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        loading={isSubmitting}
      />
    </Section.Root>
  );
};
