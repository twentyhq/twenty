import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { currentActionIdComponentState } from '@/action-menu/states/currentActionIdComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const Actions = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}) => {
  const currentActionId = useRecoilComponentValueV2(
    currentActionIdComponentState,
  );

  const actions = useRegisteredActions();

  return (
    <>
      {actions.map(
        (action) =>
          currentActionId === action.key && (
            <action.component
              key={action.key}
              objectMetadataItem={objectMetadataItem}
            />
          ),
      )}
    </>
  );
};
