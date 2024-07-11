import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { isNonEmptyString } from '@sniptt/guards';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHandleRecordChipClick = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const navigate = useNavigate();
  const linkToShowPage = getLinkToShowPage(objectNameSingular, {
    id: recordId,
  });

  const handleRecordChipClick = (event: MouseEvent) => {
    if (isNonEmptyString(linkToShowPage)) {
      event.stopPropagation();
      navigate(linkToShowPage);
    }
  };

  return { handleRecordChipClick };
};
