import { useFieldMetadataItem } from "@/object-metadata/hooks/useFieldMetadataItem";
import { useFilteredObjectMetadataItems } from "@/object-metadata/hooks/useFilteredObjectMetadataItems";
import { useGetRelationMetadata } from "@/object-metadata/hooks/useGetRelationMetadata";
import { useUpdateOneFieldMetadataItem } from "@/object-metadata/hooks/useUpdateOneFieldMetadataItem";
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useSnackBar } from "@/ui/feedback/snack-bar-manager/hooks/useSnackBar";
import { DropdownMenuSeparator } from "@/ui/layout/dropdown/components/DropdownMenuSeparator";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { IconPlus } from "twenty-ui/display";
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateApp } from "~/hooks/useNavigateApp";
import { useNavigateSettings } from "~/hooks/useNavigateSettings";


const AddStyleContainer =  {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

export const ObjectFilterDropdownCreateNewOption = ({name, options}:{name:string, options:FieldMetadataItemOption[]}) => {
  const navigateSettings = useNavigateSettings();
  const navigateApp = useNavigateApp();

  const { enqueueErrorSnackBar } = useSnackBar();
  
  const { objectNamePlural = '', fieldName = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } = useFilteredObjectMetadataItems();
  
  const objectMetadataItem = findObjectMetadataItemByNamePlural(objectNamePlural);
  
  const { deactivateMetadataField, activateMetadataField } = useFieldMetadataItem();
  
  const [newNameDuringSave, setNewNameDuringSave] = useState<string | null>(null);
  
  
  
  const getRelationMetadata = useGetRelationMetadata();
  
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  
  //   const formConfig = useForm<SettingsDataModelFieldEditFormValues>({
  //     mode: 'onTouched',
  //     resolver: zodResolver(settingsFieldFormSchema()),
  //     values: {
  //       icon: fieldMetadataItem?.icon ?? 'Icon',
  //       type: fieldMetadataItem?.type as SettingsFieldType,
  //       label: fieldMetadataItem?.label ?? '',
  //       description: fieldMetadataItem?.description,
  //       isLabelSyncedWithName: fieldMetadataItem?.isLabelSyncedWithName ?? true,
  //     },
  //   });
  
  //   useEffect(() => {
  //     if (!objectMetadataItem || !fieldMetadataItem) {
  //       navigateApp(AppPath.NotFound);
  //     }
  //   }, [navigateApp, objectMetadataItem, fieldMetadataItem]);
  
  //   const { isDirty, isValid, isSubmitting } = formConfig.formState;
  
  //   const canSave = isDirty && isValid && !isSubmitting;
  
  //   if (!isDefined(objectMetadataItem) || !isDefined(fieldMetadataItem)) {
  //     return null;
  //   }
  
  //   const isLabelIdentifier = isLabelIdentifierField({
  //     fieldMetadataItem: fieldMetadataItem,
  //     objectMetadataItem: objectMetadataItem,
  //   });
  
  //   const handleSave = async (
  //     formValues: SettingsDataModelFieldEditFormValues,
  //   ) => {
  //     const { dirtyFields } = formConfig.formState;
  //     setNewNameDuringSave(formValues.name);
  
  //     try {
  //       if (
  //         formValues.type === FieldMetadataType.RELATION &&
  //         'relation' in formValues &&
  //         'relation' in dirtyFields
  //       ) {
  //         const { relationFieldMetadataItem } =
  //           getRelationMetadata({
  //             fieldMetadataItem: fieldMetadataItem,
  //           }) ?? {};
  
  //         if (isDefined(relationFieldMetadataItem)) {
  //           await updateOneFieldMetadataItem({
  //             objectMetadataId: objectMetadataItem.id,
  //             fieldMetadataIdToUpdate: relationFieldMetadataItem.id,
  //             updatePayload: formValues.relation.field,
  //           });
  //         }
  //       }
  
  //       const otherDirtyFields = omit(dirtyFields, 'relation');
  
  //       if (Object.keys(otherDirtyFields).length > 0) {
  //         const formattedInput = pick(
  //           formatFieldMetadataItemInput(formValues),
  //           Object.keys(otherDirtyFields),
  //         );
  
  //         await updateOneFieldMetadataItem({
  //           objectMetadataId: objectMetadataItem.id,
  //           fieldMetadataIdToUpdate: fieldMetadataItem.id,
  //           updatePayload: formattedInput,
  //         });
  
  //         navigateSettings(SettingsPath.ObjectDetail, {
  //           objectNamePlural,
  //         });
  //       }
  //     } catch (error) {
  //       enqueueErrorSnackBar({
  //         apolloError: error instanceof ApolloError ? error : undefined,
  //       });
  //     }
  //   };


  return (
    <>
      <MenuItem text="No results" />
      <DropdownMenuSeparator />
      <MenuItem  text={
        <div style={AddStyleContainer}>
        <IconPlus size={14} />
        Add "{name}" to options
        </div>
      }/>
    </>
  )
}
