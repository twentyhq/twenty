import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { lastLoadedStandaloneRecordTableViewIdComponentState } from '@/object-record/record-table-standalone/states/lastLoadedStandaloneRecordTableViewIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type StandaloneRecordTableViewLoadEffectProps = {
  viewId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const StandaloneRecordTableViewLoadEffect = ({
  viewId,
  objectMetadataItem,
}: StandaloneRecordTableViewLoadEffectProps) => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const [
    lastLoadedStandaloneRecordTableViewId,
    setLastLoadedStandaloneRecordTableViewId,
  ] = useAtomComponentState(
    lastLoadedStandaloneRecordTableViewIdComponentState,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId,
  });

  const viewHasFields =
    isDefined(view) && view.viewFields.length > 0;

  useEffect(() => {
    if (!isDefined(view)) {
      return;
    }

    if (!viewHasFields) {
      return;
    }

    if (viewId === lastLoadedStandaloneRecordTableViewId) {
      return;
    }

    setLastLoadedStandaloneRecordTableViewId(viewId);
    loadRecordIndexStates(view, objectMetadataItem);
  }, [
    viewId,
    lastLoadedStandaloneRecordTableViewId,
    setLastLoadedStandaloneRecordTableViewId,
    view,
    viewHasFields,
    objectMetadataItem,
    loadRecordIndexStates,
  ]);

  return null;
};
