import { RegisterRecordActionEffect } from '@/action-menu/actions/record-actions/components/RegisterRecordActionEffect';
import { useRegisteredRecordActions } from '@/action-menu/hooks/useRegisteredRecordActions';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type RegisterRecordActionEffectsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const RegisterRecordActionEffects = ({
  objectMetadataItem,
}: RegisterRecordActionEffectsProps) => {
  const actionsToRegister = useRegisteredRecordActions({
    objectMetadataItem,
  });

  return (
    <>
      {actionsToRegister.map((action) => (
        <RegisterRecordActionEffect
          key={action.key}
          action={action}
          objectMetadataItem={objectMetadataItem}
        />
      ))}
    </>
  );
};
