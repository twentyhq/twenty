export abstract class BaseObjectMetadata {
  id: string;

  name: string;

  createdBy: string;

  position: number;

  searchVector: string | null;

  //taskTargets
  //noteTargets
  //attachments
  //favorites
  //timelineActivities

  createdAt: string;

  updatedAt: string;

  deletedAt: string | null;
}
