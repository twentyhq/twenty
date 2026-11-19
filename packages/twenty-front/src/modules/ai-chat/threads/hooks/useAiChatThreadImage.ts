import { isNonEmptyString } from '@sniptt/guards';
import { AGENT_CHAT_THREAD_DEFAULT_ICON_NAME } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { type ThemeColor } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DEFAULT_ICON_COLOR } from '@/ai-chat/threads/constants/AiChatThreadDefaultIconColor';
import { useRefreshAiChatThreadImageFile } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadImageFile';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatThreadImage = (
  thread: Pick<AiChatThreadRecord, 'id' | 'icon' | 'iconColor'>,
) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { uploadFile } = useDirectFileUpload();
  const { enqueueToast } = useToast();
  const { refreshAiChatThreadImageFile } = useRefreshAiChatThreadImageFile();
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const imageFileFieldMetadataItem = objectMetadataItem?.fields.find(
    ({ name }) => name === 'imageFile',
  );

  const updateThreadImage = async (
    updateOneRecordInput: Partial<
      Pick<AiChatThreadRecord, 'icon' | 'iconColor' | 'imageFile'>
    >,
  ) => {
    try {
      await updateOneRecord({
        objectNameSingular: StandardObjectNameSingular.AgentChatThread,
        idToUpdate: thread.id,
        updateOneRecordInput,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const setIcon = (icon: string) =>
    updateThreadImage({
      icon,
      iconColor: isNonEmptyString(thread.iconColor)
        ? thread.iconColor
        : AI_CHAT_THREAD_DEFAULT_ICON_COLOR,
      imageFile: null,
    });

  const setIconColor = (iconColor: ThemeColor) =>
    updateThreadImage({
      icon: isNonEmptyString(thread.icon)
        ? thread.icon
        : AGENT_CHAT_THREAD_DEFAULT_ICON_NAME,
      iconColor,
      imageFile: null,
    });

  const uploadImage = async (file: File) => {
    if (!isDefined(imageFileFieldMetadataItem)) {
      return;
    }

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId: imageFileFieldMetadataItem.id,
      });

      await updateThreadImage({
        imageFile: [{ fileId: uploadedFile.id, label: file.name }],
      });
      await refreshAiChatThreadImageFile(thread.id);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const removeImage = () => updateThreadImage({ imageFile: null });

  return {
    removeImage,
    canCustomizeImage: isDefined(imageFileFieldMetadataItem),
    setIcon,
    setIconColor,
    uploadImage,
  };
};
