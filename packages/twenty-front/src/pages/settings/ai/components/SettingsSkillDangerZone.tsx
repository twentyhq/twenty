import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { IconArchive, IconArchiveOff, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  ActivateSkillDocument,
  DeactivateSkillDocument,
  DeleteSkillDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const DELETE_SKILL_MODAL_ID = 'delete-skill-modal';

type SettingsSkillDangerZoneProps = {
  skill: { id: string; isActive: boolean; isCustom: boolean };
};

export const SettingsSkillDangerZone = ({
  skill,
}: SettingsSkillDangerZoneProps) => {
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
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
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
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
          onClick={handleToggleActive}
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
      <ConfirmationModal
        modalInstanceId={DELETE_SKILL_MODAL_ID}
        title={t`Delete Skill`}
        subtitle={t`Are you sure you want to delete this skill? This action cannot be undone.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        loading={isSubmitting}
      />
    </Section>
  );
};
