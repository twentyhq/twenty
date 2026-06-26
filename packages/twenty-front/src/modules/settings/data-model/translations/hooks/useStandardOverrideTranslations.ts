import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

const FIND_OBJECT_METADATA_TRANSLATIONS = gql`
  query FindObjectMetadataTranslations($objectMetadataId: UUID!) {
    object(id: $objectMetadataId) {
      id
      standardOverrides {
        translations
      }
    }
  }
`;

const FIND_FIELD_METADATA_TRANSLATIONS = gql`
  query FindFieldMetadataTranslations($fieldMetadataId: UUID!) {
    field(id: $fieldMetadataId) {
      id
      standardOverrides {
        translations
      }
    }
  }
`;

const UPDATE_OBJECT_METADATA_TRANSLATIONS = gql`
  mutation UpdateObjectMetadataTranslations(
    $idToUpdate: UUID!
    $updatePayload: UpdateObjectPayload!
  ) {
    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {
      id
      standardOverrides {
        translations
      }
    }
  }
`;

const UPDATE_FIELD_METADATA_TRANSLATIONS = gql`
  mutation UpdateFieldMetadataTranslations(
    $idToUpdate: UUID!
    $updatePayload: UpdateFieldInput!
  ) {
    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
      id
      standardOverrides {
        translations
      }
    }
  }
`;

export type StandardOverrideTranslationsTarget =
  | { kind: 'object'; objectMetadataId: string }
  | { kind: 'field'; fieldMetadataId: string };

export type LocaleLabelTranslations = Record<string, string | null>;

export type StandardOverrideTranslationsByLocale = Record<
  string,
  LocaleLabelTranslations
>;

type StandardOverridesWithTranslations = {
  standardOverrides?: {
    translations?: StandardOverrideTranslationsByLocale | null;
  } | null;
};

type StandardOverrideTranslationsQueryData = {
  object?: StandardOverridesWithTranslations | null;
  field?: StandardOverridesWithTranslations | null;
};

export const useStandardOverrideTranslations = (
  target: StandardOverrideTranslationsTarget,
) => {
  const isObjectTarget = target.kind === 'object';

  const { data, loading } = useQuery<StandardOverrideTranslationsQueryData>(
    isObjectTarget
      ? FIND_OBJECT_METADATA_TRANSLATIONS
      : FIND_FIELD_METADATA_TRANSLATIONS,
    {
      variables:
        target.kind === 'object'
          ? { objectMetadataId: target.objectMetadataId }
          : { fieldMetadataId: target.fieldMetadataId },
    },
  );

  const translationsByLocale: StandardOverrideTranslationsByLocale =
    (isObjectTarget
      ? data?.object?.standardOverrides?.translations
      : data?.field?.standardOverrides?.translations) ?? {};

  const [updateObjectMetadataTranslations, { loading: isSavingObject }] =
    useMutation(UPDATE_OBJECT_METADATA_TRANSLATIONS);
  const [updateFieldMetadataTranslations, { loading: isSavingField }] =
    useMutation(UPDATE_FIELD_METADATA_TRANSLATIONS);

  const saveLocaleTranslations = async ({
    locale,
    labelTranslations,
  }: {
    locale: string;
    labelTranslations: LocaleLabelTranslations;
  }) => {
    const translations = { [locale]: labelTranslations };

    if (target.kind === 'object') {
      await updateObjectMetadataTranslations({
        variables: {
          idToUpdate: target.objectMetadataId,
          updatePayload: { translations },
        },
      });

      return;
    }

    await updateFieldMetadataTranslations({
      variables: {
        idToUpdate: target.fieldMetadataId,
        updatePayload: { translations },
      },
    });
  };

  return {
    translationsByLocale,
    loading,
    isSaving: isSavingObject || isSavingField,
    saveLocaleTranslations,
  };
};
