import { useViewStatesV2 } from './useViewStatesV2';

type UseViewProps = {
  viewScopeId?: string;
};

export const useViewV2 = (viewScopeId: string, states: string[] = []) => {
  // const scopeId = useAvailableScopeIdOrThrow(
  //   ViewScopeInternalContext,
  //   props?.viewScopeId,
  // );

  const { currentViewId, setCurrentViewId, currentView } = useViewStatesV2(
    viewScopeId,
    states,
  );

  // const { persistViewSorts, upsertViewSort } = useViewSorts(scopeId);
  // const { persistViewFilters } = useViewFilters(scopeId);
  // const { persistViewFields } = useViewFields(scopeId);
  // const { createView: internalCreateView, deleteView: internalDeleteView } =
  //   useViews(scopeId);

  // const [_, setSearchParams] = useSearchParams();

  // const resetViewBar = () => {
  //   if (savedViewFilters) {
  //     setCurrentViewFilters?.(savedViewFilters);
  //   }
  //   if (savedViewSorts) {
  //     setCurrentViewSorts?.(savedViewSorts);
  //   }
  //   setViewEditMode?.('none');
  //   setIsViewBarExpanded?.(false);
  // };

  // const createView = async (name: string) => {
  //   if (!currentViewSorts || !currentViewFilters || !currentViewFields) {
  //     return;
  //   }

  //   const newViewId = v4();
  //   await internalCreateView({ id: v4(), name });

  //   // await persistViewFields();
  //   await persistViewFilters();
  //   await persistViewSorts();
  //   //setCurrentViewId(newViewId);

  //   setSearchParams({ view: newViewId });
  // };

  // const updateCurrentView = async () => {
  //   await persistViewFilters();
  //   await persistViewSorts();
  // };

  // const removeView = useRecoilCallback(
  //   ({ set, snapshot }) =>
  //     async (viewId: string) => {
  //       const currentViewId = await snapshot.getPromise(
  //         currentViewIdScopedState({ scopeId }),
  //       );

  //       if (currentViewId === viewId)
  //         set(currentViewIdScopedState({ scopeId }), undefined);

  //       set(viewsScopedState({ scopeId }), (previousViews) =>
  //         previousViews.filter((view) => view.id !== viewId),
  //       );
  //       internalDeleteView(viewId);
  //     },
  //   [internalDeleteView, scopeId],
  // );

  return {
    // scopeId,
    currentViewId,
    currentView,
    setCurrentViewId,
    // updateCurrentView,
    // createView,
    // removeView,
    // isViewBarExpanded,
    // setIsViewBarExpanded,
    // // resetViewBar,

    // views,
    // setViews,
    // viewEditMode,
    // setViewEditMode,
    // viewObjectId,
    // setViewObjectId,
    // viewType,
    // setViewType,
    // entityCountInCurrentView,
    // setEntityCountInCurrentView,
    // currentViewSortsOrderBy,

    // availableSorts,
    // setAvailableSorts,
    // currentViewSorts,
    // setCurrentViewSorts,
    // savedViewSorts,
    // savedViewSortsByKey,
    // setSavedViewSorts,
    // canPersistSorts,
    // // upsertViewSort,

    // availableFilters,
    // setAvailableFilters,
    // currentViewFilters,
    // setCurrentViewFilters,
    // savedViewFilters,
    // savedViewFiltersByKey,
    // setSavedViewFilters,
    // canPersistFilters,

    // availableFields,
    // setAvailableFields,
    // currentViewFields,
    // savedViewFieldsByKey,
    // setCurrentViewFields,
    // savedViewFields,
    // setSavedViewFields,

    // onViewSortsChange,
    // setOnViewSortsChange,
    // onViewFiltersChange,
    // setOnViewFiltersChange,
    // onViewFieldsChange,
    // setOnViewFieldsChange,

    // persistViewFields,
  };
};
