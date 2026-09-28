import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

type CoreObjectIdentifierBarProps = {
  isReadOnly?: boolean;
  recordId: string;
  name: string | null | undefined;
  namePlaceholder: string;
  onRename: (name: string) => Promise<boolean>;
};

export const CoreObjectIdentifierBar = ({
  recordId,
  name,
  namePlaceholder,
  onRename,
  isReadOnly = false,
}: CoreObjectIdentifierBarProps) => {
  const [editedName, setEditedName] = useState<string>();
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId, allowRequestsToTwentyIcons },
  );

  const saveName = async () => {
    if (isReadOnly || !isDefined(editedName)) {
      return;
    }

    const didSave = await onRename(editedName);

    if (didSave) {
      setEditedName((currentName) =>
        currentName === editedName ? undefined : currentName,
      );
    }
  };

  return (
    <StyledBar>
      <HeaderIdentifier
        fontSize="lg"
        avatar={{
          src: getAbsoluteImageUrl(recordIdentifier?.avatarUrl ?? ''),
          colorSeed: recordId,
          name: recordIdentifier?.name ?? '',
          shape: recordIdentifier?.avatarShape ?? 'circle',
        }}
        title={
          <TitleInput
            instanceId={`core-object-name-${recordId}`}
            sizeVariant="sm"
            disabled={isReadOnly}
            value={editedName ?? name ?? ''}
            placeholder={namePlaceholder}
            onChange={setEditedName}
            onEnter={saveName}
            onEscape={() => setEditedName(undefined)}
            onClickOutside={saveName}
            onTab={saveName}
            onShiftTab={saveName}
          />
        }
      />
      <RecordIdentifierBarCreatedAt objectRecordId={recordId} />
    </StyledBar>
  );
};
