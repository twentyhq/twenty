import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import {
  type FieldsConfiguration,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationSectionEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationSectionEditor';

type FieldsConfigurationEditorProps = {
  configuration: FieldsConfiguration;
  onChange: (configuration: FieldsConfiguration) => void;
};

export const FieldsConfigurationEditor = ({
  configuration,
  onChange,
}: FieldsConfigurationEditorProps) => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const handleSectionChange = (
    sectionId: string,
    updatedSection: FieldsConfigurationSection,
  ) => {
    const updatedSections = configuration.sections.map((section) =>
      section.id === sectionId ? updatedSection : section,
    );

    onChange({
      ...configuration,
      sections: updatedSections,
    });
  };

  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  if (sortedSections.length === 0) {
    return null;
  }

  return (
    <>
      {sortedSections.map((section, index) => (
        <FieldsConfigurationSectionEditor
          key={section.id}
          section={section}
          index={index}
          objectMetadataItem={objectMetadataItem}
          onSectionChange={(updatedSection) =>
            handleSectionChange(section.id, updatedSection)
          }
        />
      ))}
    </>
  );
};
