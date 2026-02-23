import { metadataStoreState } from '@/app/states/metadataStoreState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { logicFunctionsState } from '@/settings/logic-functions/states/logicFunctionsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  ViewType as CoreViewType,
  useFindAllRecordPageLayoutsQuery,
  useFindFieldsWidgetCoreViewsQuery,
  useFindManyLogicFunctionsQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const FIELDS_WIDGET_VIEW_TYPES = [CoreViewType.FIELDS_WIDGET];

export const LazyMetadataLoadEffect = () => {
  const location = useLocation();
  const isLoggedIn = useIsLogged();
  const store = useStore();

  const setLogicFunctions = useSetRecoilState(logicFunctionsState);

  const isOnAuthPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const shouldSkip = !isLoggedIn || isOnAuthPath;

  const { data: queryDataFieldsWidgetCoreViews } =
    useFindFieldsWidgetCoreViewsQuery({
      skip: shouldSkip,
      variables: { viewTypes: FIELDS_WIDGET_VIEW_TYPES },
    });

  const { data: queryDataRecordPageLayouts } = useFindAllRecordPageLayoutsQuery(
    { skip: shouldSkip },
  );

  const { data: logicFunctionsData } = useFindManyLogicFunctionsQuery({
    skip: !isLoggedIn,
  });

  const setFieldsWidgetCoreViews = useCallback(
    (fieldsWidgetViews: CoreViewWithRelations[]) => {
      const existingCoreViews = store.get(coreViewsState.atom);
      const existingIndexViews = existingCoreViews.filter(
        (view) => view.type !== CoreViewType.FIELDS_WIDGET,
      );
      const mergedViews = [...existingIndexViews, ...fieldsWidgetViews];

      if (!isDeeplyEqual(existingCoreViews, mergedViews)) {
        store.set(coreViewsState.atom, mergedViews);
      }
    },
    [store],
  );

  const setRecordPageLayouts = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordPageLayouts: PageLayout[]) => {
        const existingRecordPageLayouts = snapshot
          .getLoadable(recordPageLayoutsState)
          .getValue();

        if (!isDeeplyEqual(existingRecordPageLayouts, recordPageLayouts)) {
          set(recordPageLayoutsState, recordPageLayouts);
        }

        store.set(metadataStoreState.atomFamily('pageLayouts'), {
          current: recordPageLayouts,
          draft: [],
          status: 'loaded',
        });
      },
    [store],
  );

  useEffect(() => {
    if (!isDefined(queryDataFieldsWidgetCoreViews?.getCoreViews)) {
      return;
    }

    setFieldsWidgetCoreViews(queryDataFieldsWidgetCoreViews.getCoreViews);
  }, [queryDataFieldsWidgetCoreViews?.getCoreViews, setFieldsWidgetCoreViews]);

  useEffect(() => {
    if (!isDefined(queryDataRecordPageLayouts?.getPageLayouts)) {
      return;
    }

    const transformedPageLayouts =
      queryDataRecordPageLayouts.getPageLayouts.map(transformPageLayout);

    setRecordPageLayouts(transformedPageLayouts);
  }, [queryDataRecordPageLayouts?.getPageLayouts, setRecordPageLayouts]);

  useEffect(() => {
    if (!isDefined(logicFunctionsData?.findManyLogicFunctions)) {
      return;
    }

    setLogicFunctions(logicFunctionsData.findManyLogicFunctions);

    store.set(metadataStoreState.atomFamily('logicFunctions'), {
      current: logicFunctionsData.findManyLogicFunctions,
      draft: [],
      status: 'loaded',
    });
  }, [logicFunctionsData?.findManyLogicFunctions, setLogicFunctions, store]);

  return null;
};
