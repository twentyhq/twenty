import { parseCrudToolName } from '@/ai/utils/tool-display/parse-crud-tool-name.util';

describe('parseCrudToolName', () => {
  it('should parse create_one tools', () => {
    expect(parseCrudToolName('create_one_company')).toEqual({
      operation: 'create_one',
      objectSlug: 'company',
    });
  });

  it('should parse find_many tools', () => {
    expect(parseCrudToolName('find_many_companies')).toEqual({
      operation: 'find_many',
      objectSlug: 'companies',
    });
  });

  it('should return null for non-CRUD tools', () => {
    expect(parseCrudToolName('send_email')).toBeNull();
    expect(parseCrudToolName('web_search')).toBeNull();
  });
});
