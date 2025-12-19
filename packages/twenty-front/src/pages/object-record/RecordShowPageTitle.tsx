import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordShowPageTitle = ({
  objectNameSingular,
  objectRecordId,
}: {
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({ objectNameSingular });

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const record = useRecoilValue(recordStoreFamilyState(objectRecordId));

  const pageName = isDefined(record)
    ? getLabelIdentifierFieldValue(record, labelIdentifierFieldMetadataItem)
    : '';

  const pageTitle = pageName.trim()
    ? `${pageName} - ${objectMetadataItem.labelSingular}`
    : objectMetadataItem.labelSingular;

  return <PageTitle title={pageTitle} />;
};
