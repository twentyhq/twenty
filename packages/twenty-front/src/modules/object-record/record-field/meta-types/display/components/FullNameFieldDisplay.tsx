import { isNonEmptyString } from '@sniptt/guards';

import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const MOBILE_MAX_LENGTH = 15;
const DESKTOP_MAX_LENGTH = 20;

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();
  const isMobile = useIsMobile(); 

  const truncateTheContent = (contentToTruncate: string, maxLength: number) => {
   return contentToTruncate.length > maxLength ? `${contentToTruncate.slice(0, maxLength)}...` : contentToTruncate;
  }

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

    const maxLength = isMobile ? MOBILE_MAX_LENGTH : DESKTOP_MAX_LENGTH;
    const truncatedContent = truncateTheContent(content, maxLength);

    return <TextDisplay text={truncatedContent} />;
};
