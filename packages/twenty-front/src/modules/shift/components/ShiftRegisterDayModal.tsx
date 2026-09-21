import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Heading } from 'twenty-ui/primitives/typography';

import { type ShiftDayRegistrationResult } from '@/shift/hooks/useShiftRegistration';
import { type ShiftTemplateRecord } from '@/shift/hooks/useShiftTemplates';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
  min-width: 380px;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
  max-height: 360px;
  overflow-y: auto;
`;

const StyledRow = styled.label<{ isDisabled: boolean }>`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing['3']};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.7 : 1)};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
`;

const StyledRowMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  min-width: 0;
`;

const StyledRowTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledCodeChip = styled.span<{ hasColor: boolean }>`
  background-color: ${({ hasColor }) =>
    hasColor ? 'transparent' : themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ hasColor }) =>
    hasColor
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing['1']} ${themeCssVariables.spacing['2']};
`;

const StyledWindow = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledRegisteredTag = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing['1']};
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledErrorList = styled.div`
  border: 1px solid ${themeCssVariables.color.red};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
`;

const StyledErrorItem = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  justify-content: flex-end;
`;

type ShiftRegisterDayModalProps = {
  modalInstanceId: string;
  dayLabel: string;
  templates: ShiftTemplateRecord[];
  registeredTemplateIds: Set<string>;
  isRegistering: boolean;
  onRegister: (templateIds: string[]) => Promise<ShiftDayRegistrationResult>;
  onClose: () => void;
};

export const ShiftRegisterDayModal = ({
  modalInstanceId,
  dayLabel,
  templates,
  registeredTemplateIds,
  isRegistering,
  onRegister,
  onClose,
}: ShiftRegisterDayModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errorByTemplateId, setErrorByTemplateId] = useState<
    Record<string, string>
  >({});

  const resetAndClose = () => {
    setSelectedIds(new Set());
    setErrorByTemplateId({});
    closeModal(modalInstanceId);
    onClose();
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }

      return next;
    });
  };

  const handleConfirm = async () => {
    const templateIds = [...selectedIds];

    if (templateIds.length === 0) {
      return;
    }

    const { errors } = await onRegister(templateIds);

    if (errors.length === 0) {
      resetAndClose();

      return;
    }

    // Keep the modal open with only the failed templates still checked, so a
    // retry is one click away; surface each server message inline.
    const nextErrorByTemplateId: Record<string, string> = {};
    const failedIds = new Set<string>();

    for (const error of errors) {
      nextErrorByTemplateId[error.templateId] = error.message;
      failedIds.add(error.templateId);
    }

    setErrorByTemplateId(nextErrorByTemplateId);
    setSelectedIds(failedIds);
  };

  const selectedCount = selectedIds.size;

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable
      onClose={resetAndClose}
      renderInDocumentBody
    >
      <StyledContent>
        <Heading level={1} size="lg">{t`Register shifts`}</Heading>
        <StyledSubtitle>{dayLabel}</StyledSubtitle>
        {templates.length === 0 ? (
          <StyledEmpty>{t`No shifts available for this day.`}</StyledEmpty>
        ) : (
          <StyledList>
            {templates.map((template) => {
              const hasColor = isDefined(template.color);
              const isRegistered = registeredTemplateIds.has(template.id);
              const isChecked = isRegistered || selectedIds.has(template.id);
              const templateError = errorByTemplateId[template.id];

              return (
                <StyledRow key={template.id} isDisabled={isRegistered}>
                  <Checkbox
                    checked={isChecked}
                    disabled={isRegistered}
                    onChange={() => toggleTemplate(template.id)}
                    aria-label={t`Register ${template.code}`}
                  />
                  <StyledRowMain>
                    <StyledRowTitle>
                      <StyledCodeChip
                        hasColor={hasColor}
                        style={
                          hasColor
                            ? { backgroundColor: template.color ?? undefined }
                            : undefined
                        }
                      >
                        {template.code}
                      </StyledCodeChip>
                      {template.name}
                    </StyledRowTitle>
                    <StyledWindow>
                      {template.startTime} – {template.endTime}
                    </StyledWindow>
                    {isDefined(templateError) && (
                      <StyledErrorList>
                        <StyledErrorItem>{templateError}</StyledErrorItem>
                      </StyledErrorList>
                    )}
                  </StyledRowMain>
                  {isRegistered && (
                    <StyledRegisteredTag>
                      <IconLock size={12} />
                      {t`Registered`}
                    </StyledRegisteredTag>
                  )}
                </StyledRow>
              );
            })}
          </StyledList>
        )}
        <StyledFooter>
          <Button
            title={t`Close`}
            variant="secondary"
            onClick={resetAndClose}
            disabled={isRegistering}
          />
          <Button
            title={t`Register ${selectedCount} shift(s)`}
            variant="primary"
            accent="blue"
            onClick={handleConfirm}
            disabled={selectedCount === 0 || isRegistering}
          />
        </StyledFooter>
      </StyledContent>
    </ModalStatefulWrapper>
  );
};
