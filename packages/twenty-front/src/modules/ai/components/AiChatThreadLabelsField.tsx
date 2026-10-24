import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DetailsRow } from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPencil, IconTag } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/AiChatThreadDetailsLabelWidthInPx';
import { type AiChatThreadLabel } from '@/ai/types/AiChatThreadLabel';

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatThreadLabelsFieldProps = {
  labels: AiChatThreadLabel[];
  selectedLabelIds: string[];
  isSaving?: boolean;
  onLabelsChange?: (labelIds: string[]) => void;
};

export const AiChatThreadLabelsField = ({
  labels,
  selectedLabelIds,
  isSaving = false,
  onLabelsChange,
}: AiChatThreadLabelsFieldProps) => {
  const { t } = useLingui();
  const selectedLabels = labels.filter(({ id }) =>
    selectedLabelIds.includes(id),
  );

  return (
    <DetailsRow
      labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
      startIcon={<IconTag size={themeCssVariables.icon.size.md} />}
      label={t`Labels`}
      action={
        isDefined(onLabelsChange) && (
          <Dropdown.Root type="menu" multiple>
            <Dropdown.Trigger
              render={
                <LightIconButton
                  aria-label={t`Edit shared labels`}
                  title={t`Edit shared labels`}
                  disabled={isSaving}
                  emphasis="subtle"
                >
                  <IconPencil />
                </LightIconButton>
              }
            />
            <Dropdown.Content aria-label={t`Shared conversation labels`}>
              <Dropdown.Section label={t`Shared conversation labels`}>
                {!isNonEmptyArray(labels) && (
                  <Dropdown.Empty>{t`No labels available`}</Dropdown.Empty>
                )}
                {labels.map(({ id, label, color }) => (
                  <Dropdown.OptionItem
                    key={id}
                    selected={selectedLabelIds.includes(id)}
                    disabled={isSaving}
                    onSelect={() =>
                      onLabelsChange(
                        selectedLabelIds.includes(id)
                          ? selectedLabelIds.filter(
                              (selectedId) => selectedId !== id,
                            )
                          : [...selectedLabelIds, id],
                      )
                    }
                  >
                    <Tag color={color}>{label}</Tag>
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>
        )
      }
    >
      {isNonEmptyArray(selectedLabels) ? (
        selectedLabels.map(({ id, label, color }) => (
          <Tag key={id} color={color}>
            {label}
          </Tag>
        ))
      ) : (
        <StyledEmptyValue>{t`None`}</StyledEmptyValue>
      )}
    </DetailsRow>
  );
};
