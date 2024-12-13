import { getFunctionInputSchema } from '@/serverless-functions/utils/getFunctionInputSchema';

describe('getFunctionInputSchema', () => {
  it('should analyze a simple function correctly', () => {
    const fileContent = `
        function testFunction(param1: string, param2: number): void {
          return;
        }
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([{ type: 'string' }, { type: 'number' }]);
  });

  it('should analyze a arrow function correctly', () => {
    const fileContent = `
        export const main = async (
          param1: string,
          param2: number,
        ): Promise<object> => {
          return param1;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([{ type: 'string' }, { type: 'number' }]);
  });

  it('should analyze a complex function correctly', () => {
    const fileContent = `
        function testFunction(
          params: {
            param1: string;
            param2: number;
            param3: boolean;
            param4: object;
            param5: { subParam1: string };
            param6: "my" | "enum";
            param7: string[];
          }
        ): void {
          return
        }
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          param1: { type: 'string' },
          param2: { type: 'number' },
          param3: { type: 'boolean' },
          param4: { type: 'object' },
          param5: {
            type: 'object',
            properties: {
              subParam1: { type: 'string' },
            },
          },
          param6: { type: 'string', enum: ['my', 'enum'] },
          param7: { type: 'array', items: { type: 'string' } },
        },
      },
    ]);
  });
});
