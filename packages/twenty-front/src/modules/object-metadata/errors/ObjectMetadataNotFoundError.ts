import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export class ObjectMetadataItemNotFoundError extends Error {
  constructor(objectName: string, objectMetadataItems: ObjectMetadataItem[]) {
    const message = `Item de metadado do objeto "${objectName}" não pode ser encontrado em um array de ${
      objectMetadataItems?.length ?? 0
    } elementos`;

    super(message);

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
