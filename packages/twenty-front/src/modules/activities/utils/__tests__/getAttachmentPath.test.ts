import { getAttachmentPath } from "@/activities/utils/getAttachmentPath";

describe('getAttachmentPath', () => {
  it('should return the attachment path', () => {
    const res = getAttachmentPath('https://example.com/files/attachment/image.jpg?queryParam=value');
    expect(res).toEqual('attachment/image.jpg');
  });
});
