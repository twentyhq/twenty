import { useLinksFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useLinksFieldDisplay';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';
import { FieldMetadataType } from 'twenty-shared/types';

export const LinksFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useLinksFieldDisplay();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  assertFieldMetadata(FieldMetadataType.LINKS, isFieldLinks, fieldDefinition);

  const actionMode =
    (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
    'copy';

  const handleClick = async (
    link: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    if (actionMode === 'copy') {
      try {
        await navigator.clipboard.writeText(link);
        enqueueSuccessSnackBar({
          message: t`Link copied to clipboard`,
          options: {
            icon: <IconCopy size={16} color="green" />,
            duration: 2000,
          },
        });
      } catch {
        enqueueErrorSnackBar({
          message: t`Error copying to clipboard`,
          options: {
            icon: <IconExclamationCircle size={16} color="red" />,
            duration: 2000,
          },
        });
      }
    } else if (actionMode === 'navigate') {
      window.open(link, '_blank');
    }
  };
  return <LinksDisplay value={fieldValue} onClick={handleClick} />;
};
