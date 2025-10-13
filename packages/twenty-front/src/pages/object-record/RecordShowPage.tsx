import { useParams } from 'react-router-dom';

import { RecordShowContent } from '~/pages/object-record/RecordShowContent';

export const RecordShowPage = () => {
  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  return (
    <>
      {parameters.objectRecordId && parameters.objectNameSingular && (
        <RecordShowContent
          objectRecordId={parameters.objectRecordId}
          objectNameSingular={parameters.objectNameSingular}
        />
      )}
    </>
  );
};
