import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { type FieldMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/field-metadata-connection-loader.factory';
import { type IndexMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/index-metadata-connection-loader.factory';

describe('DataloaderService', () => {
  it('delegates metadata connection loader creation to domain factories', () => {
    const fieldMetadataConnectionLoader = {} as ReturnType<
      FieldMetadataConnectionLoaderFactory['create']
    >;
    const indexMetadataConnectionLoader = {} as ReturnType<
      IndexMetadataConnectionLoaderFactory['create']
    >;
    const fieldMetadataConnectionLoaderFactory = {
      create: jest.fn(() => fieldMetadataConnectionLoader),
    } as unknown as FieldMetadataConnectionLoaderFactory;
    const indexMetadataConnectionLoaderFactory = {
      create: jest.fn(() => indexMetadataConnectionLoader),
    } as unknown as IndexMetadataConnectionLoaderFactory;
    const service = new DataloaderService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      fieldMetadataConnectionLoaderFactory,
      indexMetadataConnectionLoaderFactory,
    );

    const loaders = service.createLoaders();

    expect(fieldMetadataConnectionLoaderFactory.create).toHaveBeenCalledTimes(
      1,
    );
    expect(indexMetadataConnectionLoaderFactory.create).toHaveBeenCalledTimes(
      1,
    );
    expect(loaders.fieldMetadataConnectionLoader).toBe(
      fieldMetadataConnectionLoader,
    );
    expect(loaders.indexMetadataConnectionLoader).toBe(
      indexMetadataConnectionLoader,
    );
  });
});
