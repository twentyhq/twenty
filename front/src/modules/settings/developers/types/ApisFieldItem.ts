type CreatedBy = `Created by ${string}`;
export type ApisFiedlItem = {
  name: string;
  type: 'internal' | 'published';
  owner: CreatedBy;
};
