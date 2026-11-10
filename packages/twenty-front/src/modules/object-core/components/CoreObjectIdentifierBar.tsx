import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_TRACK } from '@/page-layout/constants/PageLayoutRecordIdentifierBarSideTrack';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledBar = styled.div<{ hasTabList: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: ${({ hasTabList }) =>
    hasTabList
      ? `${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_TRACK} minmax(0, 1fr) ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_TRACK}`
      : 'minmax(0, 1fr) auto'};
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTabsCell = styled.div`
  align-self: stretch;
  display: flex;
  min-width: 0;
`;

const StyledCreatedAtCell = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 0;
`;

const StyledIdentifier = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type CoreObjectIdentifierBarProps = {
  isReadOnly?: boolean;
  recordId: string;
  name: string | null | undefined;
  namePlaceholder: string;
  onRename: (name: string) => Promise<boolean>;
  avatar?: ReactNode;
  tabList?: ReactNode;
};

export const CoreObjectIdentifierBar = ({
  recordId,
  name,
  namePlaceholder,
  onRename,
  isReadOnly = false,
  avatar,
  tabList,
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

  const recordAvatar = isDefined(avatar)
    ? undefined
    : {
        src: getAbsoluteImageUrl(recordIdentifier?.avatarUrl ?? ''),
        colorSeed: recordId,
        name: recordIdentifier?.name ?? '',
        shape: recordIdentifier?.avatarShape ?? 'circle',
      };

  return (
    <StyledBar hasTabList={isDefined(tabList)}>
      <StyledIdentifier>
        {avatar}
        <HeaderIdentifier
          fontSize="lg"
          avatar={recordAvatar}
          title={
            <TitleInput
              instanceId={`core-object-name-${recordId}`}
              sizeVariant="sm"
              disabled={isReadOnly}
              value={editedName ?? name ?? ''}
              placeholder={namePlaceholder}
              textColor={
                isNonEmptyString(editedName ?? name)
                  ? undefined
                  : themeCssVariables.font.color.tertiary
              }
              onChange={setEditedName}
              onEnter={saveName}
              onEscape={() => setEditedName(undefined)}
              onClickOutside={saveName}
              onTab={saveName}
              onShiftTab={saveName}
            />
          }
        />
      </StyledIdentifier>
      {isDefined(tabList) && <StyledTabsCell>{tabList}</StyledTabsCell>}
      <StyledCreatedAtCell>
        <RecordIdentifierBarCreatedAt objectRecordId={recordId} />
      </StyledCreatedAtCell>
    </StyledBar>
  );
};
