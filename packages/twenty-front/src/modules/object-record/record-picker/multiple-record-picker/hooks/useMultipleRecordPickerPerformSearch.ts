import { useRecoilCallback } from 'recoil';

export const useMultipleRecordPickerPerformSearch = () => {
  // const instanceId = useAvailableComponentInstanceIdOrThrow(
  //   MultipleRecordPickerComponentInstanceContext,
  //   componentInstanceIdFromProps,
  // );

  // const recordPickerSearchFilter = useRecoilComponentValueV2(
  //   multipleRecordPickerSearchFilterComponentState,
  //   instanceId,
  // );

  // const { matchesSearchFilterObjectRecordsQueryResult } =
  //   useMultipleRecordPickerSearch({
  //     excludedObjects: [
  //       CoreObjectNameSingular.Task,
  //       CoreObjectNameSingular.Note,
  //     ],
  //     searchFilterValue: recordPickerSearchFilter,
  //     limit: 10,
  //   });

  // const { objectRecordForSelectArray } =
  //   useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray({
  //     multiObjectRecordsQueryResult:
  //       matchesSearchFilterObjectRecordsQueryResult,
  //   });

  const performSearch = useRecoilCallback(() => {
    return () => {
      //   setRecordMultiSelectMatchesFilterRecordsWithObjectItem(
      //     objectRecordForSelectArray,
      //   );
      console.log('performSearch');
    };
  }, []);

  return { performSearch };
};
