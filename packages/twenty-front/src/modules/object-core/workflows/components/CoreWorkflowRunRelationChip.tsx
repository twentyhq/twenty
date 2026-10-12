import { useContext, type MouseEvent } from 'react';
import { Chip } from 'twenty-ui/primitives/data-display';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';

type CoreWorkflowRunRelationChipProps = {
  label: string | null | undefined;
  colorSeed: string;
  to: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export const CoreWorkflowRunRelationChip = ({
  label,
  colorSeed,
  to,
  onClick,
}: CoreWorkflowRunRelationChipProps) => {
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  const { content } = getChipLabel(label);

  const avatar = (
    <AvatarOrIcon
      name={label ?? undefined}
      colorSeed={colorSeed}
      shape="circle"
    />
  );

  if (disableChipClick === true) {
    return (
      <Chip
        variant="ghost"
        startElement={avatar}
        style={{ paddingInlineStart: 0 }}
      >
        {content}
      </Chip>
    );
  }

  return (
    <LinkChip
      to={to}
      variant="soft"
      startElement={avatar}
      onClick={onClick}
      triggerEvent={triggerEvent}
    >
      {content}
    </LinkChip>
  );
};
