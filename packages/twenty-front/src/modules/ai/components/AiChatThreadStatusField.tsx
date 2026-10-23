import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { DetailsRow } from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconCheck,
  IconCircleDashed,
  IconPencil,
  IconZzz,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/AiChatThreadDetailsLabelWidthInPx';
import { type AiChatThreadStatusScope } from '@/ai/types/AiChatThreadStatusScope';

const StyledScope = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatThreadStatusFieldProps = {
  status: 'open' | 'snoozed' | 'done';
  scope: AiChatThreadStatusScope;
  isSaving?: boolean;
  onStatusChange?: (change: {
    status: AiChatThreadStatusFieldProps['status'];
    scope: AiChatThreadStatusScope;
  }) => void;
};

export const AiChatThreadStatusField = ({
  status,
  scope,
  isSaving = false,
  onStatusChange,
}: AiChatThreadStatusFieldProps) => {
  const { t } = useLingui();
  const scopeLabel =
    scope.type === 'personal' ? t`Your inbox` : scope.channelName;
  const statusLabels = {
    open: t`Open`,
    snoozed: t`Snoozed`,
    done: t`Done`,
  };
  const editLabel = t`Change status in ${scopeLabel}`;

  return (
    <DetailsRow
      labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
      startIcon={<IconCircleDashed size={themeCssVariables.icon.size.md} />}
      label={t`Status`}
      action={
        isDefined(onStatusChange) && (
          <Dropdown.Root type="menu">
            <Dropdown.Trigger
              render={
                <LightIconButton
                  aria-label={editLabel}
                  title={editLabel}
                  disabled={isSaving}
                  emphasis="subtle"
                >
                  <IconPencil />
                </LightIconButton>
              }
            />
            <Dropdown.Content aria-label={editLabel}>
              <Dropdown.Section label={scopeLabel}>
                <Dropdown.OptionItem
                  selected={status === 'open'}
                  startIcon={<IconCircleDashed />}
                  disabled={isSaving}
                  onSelect={() => onStatusChange({ status: 'open', scope })}
                >
                  {statusLabels.open}
                </Dropdown.OptionItem>
                <Dropdown.OptionItem
                  selected={status === 'snoozed'}
                  startIcon={<IconZzz />}
                  disabled={isSaving}
                  onSelect={() => onStatusChange({ status: 'snoozed', scope })}
                >
                  {statusLabels.snoozed}
                </Dropdown.OptionItem>
                <Dropdown.OptionItem
                  selected={status === 'done'}
                  startIcon={<IconCheck />}
                  disabled={isSaving}
                  onSelect={() => onStatusChange({ status: 'done', scope })}
                >
                  {statusLabels.done}
                </Dropdown.OptionItem>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>
        )
      }
    >
      <Tag color={status === 'open' ? 'sky' : 'gray'}>
        {statusLabels[status]}
      </Tag>
      <StyledScope>{scopeLabel}</StyledScope>
    </DetailsRow>
  );
};
