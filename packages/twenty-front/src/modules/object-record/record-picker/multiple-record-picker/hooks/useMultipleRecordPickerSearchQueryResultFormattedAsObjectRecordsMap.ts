export const useMultipleRecordPickerSearchQueryResultFormattedAsObjectRecordsMap =
  () => {
    // ({
    //   multiObjectRecordsQueryResult,
    // }: {
    //   multiObjectRecordsQueryResult:
    //     | CombinedFindManyRecordsQueryResult
    //     | null
    //     | undefined;
    // }) => {
    // const objectMetadataItemsByNamePluralMap = useRecoilValue(
    //   objectMetadataItemsByNamePluralMapSelector,
    // );
    // const formattedMultiObjectRecordsQueryResult = useMemo(() => {
    //   return multiRecordPickerFormatSearchResults(
    //     multiObjectRecordsQueryResult,
    //   );
    // }, [multiObjectRecordsQueryResult]);
    // const objectRecordsMap = useMemo(() => {
    //   const recordsByNamePlural: {
    //     [key: string]: SelectedRecordAndObjectMetadataItem[];
    //   } = {};
    //   Object.entries(formattedMultiObjectRecordsQueryResult ?? {}).forEach(
    //     ([namePlural, objectRecordConnection]) => {
    //       const objectMetadataItem =
    //         objectMetadataItemsByNamePluralMap.get(namePlural);
    //       if (!isDefined(objectMetadataItem)) return [];
    //       if (!isDefined(recordsByNamePlural[namePlural])) {
    //         recordsByNamePlural[namePlural] = [];
    //       }
    //       objectRecordConnection.edges.forEach(({ node }) => {
    //         const record = {
    //           objectMetadataItem,
    //           record: node,
    //         };
    //         recordsByNamePlural[namePlural].push(record);
    //       });
    //     },
    //   );
    //   return recordsByNamePlural;
    // }, [
    //   formattedMultiObjectRecordsQueryResult,
    //   objectMetadataItemsByNamePluralMap,
    // ]);
    // return {
    //   objectRecordsMap,
    // };
  };
