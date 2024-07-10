resource "kubernetes_namespace" "twentycrm" {
  metadata {
    annotations = {
      name = "twentycrm"
    }

    name = "twentycrm"
  }
}
