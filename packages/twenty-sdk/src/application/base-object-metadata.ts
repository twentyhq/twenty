export abstract class BaseObjectMetadata {
  id!: string;

  createdAt!: string;

  updatedAt!: string;

  deletedAt!: string | null;
}
