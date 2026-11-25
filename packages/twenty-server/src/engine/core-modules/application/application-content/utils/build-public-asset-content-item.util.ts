import { type ApplicationContentItemDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content-item.dto';
import { getPublicAssetTag } from 'src/engine/core-modules/application/application-content/utils/get-public-asset-tag.util';

export const buildPublicAssetContentItem = ({
  id,
  filePath,
  fileName,
  fileType,
}: {
  id?: string;
  filePath: string;
  fileName: string;
  fileType: string;
}): ApplicationContentItemDTO => ({
  id,
  universalIdentifier: filePath,
  label: fileName,
  tag: getPublicAssetTag(fileType),
});
