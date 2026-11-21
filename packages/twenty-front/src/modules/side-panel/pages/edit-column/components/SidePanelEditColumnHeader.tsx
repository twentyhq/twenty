import { getRecordFieldCustomLabel } from '@/object-record/record-field/utils/getRecordFieldCustomLabel';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SidePanelEditColumnHeaderProps = {
  instanceId: string;
  icon: ReactNode;
  defaultLabel: string;
  label: string | null;
  onLabelChange: (label: string | null) => void;
};

export const SidePanelEditColumnHeader = ({
  instanceId,
  icon,
  defaultLabel,
  label,
  onLabelChange,
}: SidePanelEditColumnHeaderProps) => {
  const [editedLabel, setEditedLabel] = useState<string | null>(null);

  const saveEditedLabel = () => {
    if (isDefined(editedLabel)) {
      onLabelChange(getRecordFieldCustomLabel({ editedLabel, defaultLabel }));
    }

    setEditedLabel(null);
  };

  return (
    <PageCardHeader
      title={
        <HeaderIdentifier
          icon={icon}
          title={
            <TitleInput
              instanceId={instanceId}
              sizeVariant="sm"
              value={label ?? defaultLabel}
              placeholder={defaultLabel}
              onChange={setEditedLabel}
              onEnter={saveEditedLabel}
              onEscape={() => setEditedLabel(null)}
              onClickOutside={saveEditedLabel}
              onTab={saveEditedLabel}
              onShiftTab={saveEditedLabel}
            />
          }
          label={isDefined(label) ? defaultLabel : undefined}
        />
      }
    />
  );
};
