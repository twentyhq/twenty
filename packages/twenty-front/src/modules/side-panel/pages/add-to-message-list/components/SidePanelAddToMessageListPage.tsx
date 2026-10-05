import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUserPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelAddToMessageListPage = () => {
  const [messageListId, setMessageListId] = useState<string | null>(null);

  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const { createOneRecord: createOneMessageList } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });

  const handleCreateMessageList = async (searchInput?: string) => {
    const createdMessageList = await createOneMessageList({
      name: searchInput ?? '',
    });

    setMessageListId(createdMessageList.id);
  };

  return (
    <StyledContainer>
      <StyledContent>
        <FormSingleRecordPicker
          label={t`List`}
          defaultValue={messageListId}
          objectNameSingulars={[CoreObjectNameSingular.MessageList]}
          onChange={setMessageListId}
          onClear={() => setMessageListId(null)}
          onCreate={handleCreateMessageList}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            variant="outline"
            onClick={closeSidePanelMenu}
          >{t`Cancel`}</Button>,
          <Button
            key="add-to-list"
            size="sm"
            startIcon={<IconUserPlus />}
            disabled={!isDefined(messageListId)}
            variant="solid"
            color="accent"
          >{t`Add to List`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
