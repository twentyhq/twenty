import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useRenameCoreWorkflow } from '@/object-core/workflows/hooks/useRenameCoreWorkflow';
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

type CoreWorkflowIdentifierBarProps = {
  coreWorkflowId: string;
  name: string | null | undefined;
};

export const CoreWorkflowIdentifierBar = ({
  coreWorkflowId,
  name,
}: CoreWorkflowIdentifierBarProps) => {
  const [editedName, setEditedName] = useState<string>();
  const { renameWorkflow } = useRenameCoreWorkflow({
    coreWorkflowId,
    currentName: name,
  });
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId: coreWorkflowId, allowRequestsToTwentyIcons },
  );

  const saveName = async () => {
    if (!isDefined(editedName)) {
      return;
    }

    const didSave = await renameWorkflow(editedName);

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
          colorSeed: coreWorkflowId,
          name: recordIdentifier?.name ?? '',
          shape: recordIdentifier?.avatarShape ?? 'circle',
        }}
        title={
          <TitleInput
            instanceId={`core-workflow-name-${coreWorkflowId}`}
            sizeVariant="sm"
            value={editedName ?? name ?? ''}
            placeholder={t`Workflow name`}
            onChange={setEditedName}
            onEnter={saveName}
            onEscape={() => setEditedName(undefined)}
            onClickOutside={saveName}
            onTab={saveName}
            onShiftTab={saveName}
          />
        }
      />
      <RecordIdentifierBarCreatedAt objectRecordId={coreWorkflowId} />
    </StyledBar>
  );
};
