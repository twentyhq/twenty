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
  // Committed as typed, so the form's save shortcut reads the label in the input
  const [labelBeforeEdit, setLabelBeforeEdit] = useState<{
    label: string | null;
  } | null>(null);

  const handleChange = (editedLabel: string) => {
    if (!isDefined(labelBeforeEdit)) {
      setLabelBeforeEdit({ label });
    }

    onLabelChange(getRecordFieldCustomLabel({ editedLabel, defaultLabel }));
  };

  const handleEditEnd = () => setLabelBeforeEdit(null);

  const handleEscape = () => {
    if (isDefined(labelBeforeEdit)) {
      onLabelChange(labelBeforeEdit.label);
    }

    handleEditEnd();
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
              onChange={handleChange}
              onEnter={handleEditEnd}
              onEscape={handleEscape}
              onClickOutside={handleEditEnd}
              onTab={handleEditEnd}
              onShiftTab={handleEditEnd}
            />
          }
          label={isDefined(label) ? defaultLabel : undefined}
        />
      }
    />
  );
};
