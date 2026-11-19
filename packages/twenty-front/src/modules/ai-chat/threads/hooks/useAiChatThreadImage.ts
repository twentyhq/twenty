import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { type ThemeColor } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DEFAULT_ICON_COLOR } from '@/ai-chat/threads/constants/AiChatThreadDefaultIconColor';
import { AI_CHAT_THREAD_DEFAULT_ICON_NAME } from '@/ai-chat/threads/constants/AiChatThreadDefaultIconName';
import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatThreadImage = (
  thread: Pick<AiChatThreadRecord, 'id' | 'icon' | 'iconColor'>,
) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { uploadFile } = useDirectFileUpload();
  const { enqueueToast } = useToast();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const { findOneRecord } = useLazyFindOneRecord<AiChatThreadRecord>({
    objectNameSingular: StandardObjectNameSingular.AgentChatThread,
    recordGqlFields: { id: true, imageFile: true },
    fetchPolicy: 'network-only',
  });
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
      iconColor: thread.iconColor ?? AI_CHAT_THREAD_DEFAULT_ICON_COLOR,
      imageFile: null,
    });

  const setIconColor = (iconColor: ThemeColor) =>
    updateThreadImage({
      icon: thread.icon ?? AI_CHAT_THREAD_DEFAULT_ICON_NAME,
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
      // the signed url only comes back from a read
      await findOneRecord({
        objectRecordId: thread.id,
        onCompleted: ({ id, imageFile }) =>
          applyAiChatThreadUpdate({ id, imageFile }),
      });
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
