import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';

type RecordGroupContextProviderProps = {
  objectMetadataNameSingular: string;
  children: React.ReactNode;
};

export const RecordGroupContextProvider = ({
  objectMetadataNameSingular,
  children,
}: RecordGroupContextProviderProps) => {
  const { visibleRecordGroups } = useRecordGroups({
    objectMetadataNameSingular,
  });

  if (visibleRecordGroups.length === 0) {
    return (
      <RecordGroupContext.Provider value={{ recordGroupId: 'default' }}>
        {children}
      </RecordGroupContext.Provider>
    );
  }

  return (
    <>
      {visibleRecordGroups.map((recordGroup) => (
        <RecordGroupContext.Provider
          key={recordGroup.id}
          value={{ recordGroupId: recordGroup.id }}
        >
          {children}
        </RecordGroupContext.Provider>
      ))}
    </>
  );
};
